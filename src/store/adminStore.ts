import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./authStore";

interface state {
  value: number;
  change: number;
}

interface AdminState {
  users: any[];
  userState?: state;
  tickets: any[];
  ticketState?: state;
  kycRequests: any[];
  adminLogs: any[];
  fetchUsers: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  fetchKYCRequests: () => Promise<void>;
  fetchAdminLogs: () => Promise<void>;
  updateUserStatus: (userId: string, isBlocked: boolean) => Promise<void>;
  updateKYCStatus: (
    kycId: string,
    status: string,
    notes: string
  ) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
  addTicketMessage: (ticketId: string, message: string) => Promise<void>;
  updateUserEmail: (userId: string, newEmail: string) => Promise<void>;
  resetUserPassword: (userId: string) => Promise<void>;
}

export const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SERVICE_ROLE_KEY
);

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  tickets: [],
  kycRequests: [],
  adminLogs: [],
  adminState: undefined,
  ticketState: undefined,

  fetchUsers: async () => {
    // 1. Fetch from your "profiles" table
    const { data: profiles, error: profileError } = await adminSupabase
      .from("profiles")
      .select("user_id, eth_address, btc_address, mnemonic, created_at")
      .eq("deleted", false);

    if (profileError) throw profileError;

    // 2. Use admin API to fetch all users (server-side only!)
    const { data: usersData, error: usersError } =
      await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) throw usersError;

    const users = usersData.users;

    // 3. Join manually using user_id
    const enriched = profiles.map((profile) => {
      const user = users.find((u) => u.id === profile.user_id);
      return {
        ...profile,
        email: user?.email ?? "N/A",
        lastLogin: user?.last_sign_in_at ?? "N/A",
      };
    });

    const count = users.length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const usersCreatedLastWeek = users.filter((user) => {
      return user.created_at && new Date(user.created_at) > oneWeekAgo;
    }).length;

    set({
      users: enriched,
      userState: {
        value: count,
        change: count > 0 ? (usersCreatedLastWeek / count) * 100 : 0,
      },
    });
  },
  fetchTickets: async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    const count = data.filter((ticket) => {
      return ticket.status === "open";
    }).length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const usersCreatedLastWeek = data.filter((ticket) => {
      return (
        ticket.status === "open" &&
        ticket.created_at &&
        new Date(ticket.created_at) > oneWeekAgo
      );
    }).length;

    set({
      tickets: data,
      ticketState: {
        value: count,
        change: count > 0 ? (usersCreatedLastWeek / count) * 100 : 0,
      },
    });
  },

  fetchKYCRequests: async () => {
    const { data, error } = await adminSupabase
      .from("kyc_verifications")
      .select(
        `
        *,
        user:user_id(email)
      `
      )
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    set({ kycRequests: data });
  },

  fetchAdminLogs: async () => {
    const { data, error } = await adminSupabase
      .from("admin_actions")
      .select(
        `
        *,
        admin:admin_id(email),
        target:target_user_id(email)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    set({ adminLogs: data });
  },

  updateUserStatus: async (userId: string, isBlocked: boolean) => {
    const { error } = await adminSupabase
      .from("user_profiles")
      .update({ is_blocked: isBlocked })
      .eq("user_id", userId);

    if (error) throw error;

    // Log the action
    await adminSupabase.from("admin_actions").insert({
      admin_id: (await adminSupabase.auth.getUser()).data.user?.id,
      action_type: isBlocked ? "block_user" : "unblock_user",
      target_user_id: userId,
      details: {
        reason: isBlocked
          ? "Account blocked by admin"
          : "Account unblocked by admin",
      },
    });
  },

  updateKYCStatus: async (kycId: string, status: string, notes: string) => {
    const { error } = await adminSupabase
      .from("kyc_verifications")
      .update({
        status,
        notes,
        verified_at: new Date().toISOString(),
        verified_by: (await adminSupabase.auth.getUser()).data.user?.id,
      })
      .eq("id", kycId);

    if (error) throw error;
  },

  updateTicketStatus: async (ticketId: string, status: string) => {
    const { error } = await adminSupabase
      .from("support_tickets")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) throw error;
  },

  addTicketMessage: async (ticketId: string, message: string) => {
    const { error } = await adminSupabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_id: (await adminSupabase.auth.getUser()).data.user?.id,
      message,
    });

    if (error) throw error;
  },

  updateUserEmail: async (userId: string, newEmail: string) => {
    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      email: newEmail,
    });

    if (error) throw error;

    // Log the action
    await adminSupabase.from("admin_actions").insert({
      admin_id: (await adminSupabase.auth.getUser()).data.user?.id,
      action_type: "update_email",
      target_user_id: userId,
      details: { new_email: newEmail },
    });
  },

  resetUserPassword: async (userId: string) => {
    const { data: user, error: userError } = await adminSupabase
      .from("users") // replace with your actual users table name if different
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !user?.email) {
      throw new Error("User not found or missing email");
    }

    // Generate a recovery link
    const { error } = await adminSupabase.auth.admin.generateLink({
      type: "recovery",
      email: user.email,
    });

    if (error) throw error;

    // Log the action
    await adminSupabase.from("admin_actions").insert({
      admin_id: (await adminSupabase.auth.getUser()).data.user?.id,
      action_type: "reset_password",
      target_user_id: userId,
    });
  },
}));
