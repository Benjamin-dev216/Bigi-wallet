import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Shield,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import Button from "../ui/Button";
import { supabase, useAuthStore } from "../../store/authStore";
import { useTicketStore } from "../../store/ticketStore";
const navigation = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Tickets", path: "/admin/tickets", icon: Ticket },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

const AdminLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const { addUnreadCount } = useTicketStore();

  useEffect(() => {
    const channel = supabase
      .channel("ticket-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: "is_admin=eq.false",
        },
        (payload) => {
          const msg = payload.new;
          addUnreadCount(msg.ticket_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 w-64 bg-[rgb(var(--background-light))]  flex flex-col">
        <div className="p-6 ">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold gradient-text">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-neutral-400 hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--background))]"
                }
              `}
              end={item.path === "/admin"}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <Button
            variant="outline"
            fullWidth
            className="flex items-center justify-center"
            onClick={() => logout()}
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto bg-[rgb(var(--background))]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { resetTicket } = useTicketStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className=" bg-[rgb(var(--background-light))] backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-md p-2 text-neutral-400 hover:bg-[rgb(var(--background))] hover:text-[rgb(var(--text))]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-1 md:space-x-3 inline sm:hidden">
            {/* Lock Wallet Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetTicket();
                logout();
              }}
            >
              <LogOut size={16} className="mr-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[rgb(var(--background-light))] border-t border-neutral-800">
          <nav className="flex flex-col p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-neutral-400 hover:text-[rgb(var(--text))] hover:bg-neutral-800"
                  }
                `}
                end={item.path === "/admin"}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
