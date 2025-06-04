import React from "react";
import { NavLink } from "react-router-dom";
import {
  Wallet,
  Send,
  History as ListHistory,
  Settings,
  Repeat,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <aside className="w-full h-full bg-[rgb(var(--background-light))] flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold gradient-text">BigiWallet</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <NavItem
          to="/"
          icon={<Wallet size={20} />}
          label={t("sidebar.dashboard")}
        />
        <NavItem
          to="/send-receive/send"
          icon={<Send size={20} />}
          label={t("sidebar.sendReceive")}
        />
        <NavItem
          to="/swap"
          icon={<Repeat size={20} />}
          label={t("sidebar.swap")}
        />
        <NavItem
          to="/transactions"
          icon={<ListHistory size={20} />}
          label={t("sidebar.transactions")}
        />
        <NavItem
          to="/support"
          icon={<MessageSquare size={20} />}
          label={t("sidebar.support")}
        />
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4">
        <NavItem
          to="/settings"
          icon={<Settings size={20} />}
          label={t("sidebar.settings")}
        />
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 
        ${
          isActive
            ? "bg-primary/20 text-primary"
            : "text-neutral-400 hover:text-[rgb(var(--navItem))]"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
