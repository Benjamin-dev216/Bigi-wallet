import React, { useState } from "react";
import {
  Save,
  RefreshCw,
  Shield,
  Globe2,
  Coins,
  Moon,
  Sun,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { supabase } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";

const Settings: React.FC = () => {
  const { currency, theme, setCurrency, setTheme } = useSettingsStore();

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };
  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });
    if (error) {
      toast.error("Failed to update password: " + error.message);
    } else {
      toast.success("Password updated successfully!");
      setPasswords({ new: "", confirm: "" });
    }
  };
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Globe2 size={20} className="mr-2 text-primary" />
          Settings
        </h2>

        <div className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              Currency
            </label>
            <div className="flex items-center space-x-3">
              {["USD", "EUR", "GBP"].map((curr) => {
                const isActive = currency === curr;
                return (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-[rgb(var(--background-light))] text-[rgb(var(--text))] hover:bg-primary/20"
                    }`}
                  >
                    <Coins size={16} />
                    <span>{curr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium  mb-2 text-[rgb(var(--text))]">
              Theme
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  theme === "dark"
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20 bg-[rgb(var(--background-light))] text-[rgb(var(--text))]"
                }`}
              >
                <Moon size={16} />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  theme === "light"
                    ? "bg-primary text-white"
                    : "hover:bg-primary/20 bg-[rgb(var(--background-light))] text-[rgb(var(--text))]"
                }`}
              >
                <Sun size={16} />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Shield size={20} className="mr-2 text-primary" />
          Security
        </h2>

        <div className="space-y-6">
          {/* Password Change */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              Change Password
            </label>
            <div className="space-y-3">
              <input
                type="password"
                name="new"
                className="input w-full"
                placeholder="New Password"
                value={passwords.new}
                onChange={handlePasswordChange}
              />
              <input
                type="password"
                name="confirm"
                className="input w-full"
                placeholder="Confirm New Password"
                value={passwords.confirm}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          {/* Recovery Phrase */}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSavePassword}>
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="outline" className="text-center">
        <h2 className="text-lg font-medium mb-2">BigiWallet</h2>
        <p className="text-sm text-neutral-400 mb-4">Version 1.0.0</p>
        <button className="text-primary hover:text-primary-light text-sm flex items-center justify-center mx-auto">
          <RefreshCw size={14} className="mr-1" />
          Check for updates
        </button>
      </Card>
    </div>
  );
};

export default Settings;
