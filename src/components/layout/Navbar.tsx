import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import Button from "../ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useTicketStore } from "../../store/ticketStore";
import { useTranslation } from "react-i18next";

const Navbar: React.FC = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { resetTicket } = useTicketStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return t("sidebar.dashboard");
      case "/send-receive/send":
        return t("sidebar.sendReceive");
      case "/transactions":
        return t("sidebar.transactions");
      case "/markets":
        return "Markets";
      case "/settings":
        return t("sidebar.settings");
      case "/swap":
        return t("sidebar.swap");
      default:
        return t("sidebar.dashboard");
    }
  };

  return (
    <header className="bg-[rgb(var(--background-medium))] backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-md p-2 text-neutral-400 hover:text-[rgb(var(--navItem))]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>

          {/* Page Title - visible on all screens */}
          <div className="flex-1 md:flex-initial">
            <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-1 md:space-x-3">
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
              <span className="hidden sm:inline">{t("navbar.logout")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[rgb(var(--background-light))] border-t border-neutral-800">
          <nav className="flex flex-col p-4 space-y-4">
            <a
              className={`p-2 rounded-lg ${
                location.pathname === "/"
                  ? "bg-primary/20 text-primary"
                  : "text-neutral-400 hover:text-[rgb(var(--navItem))]"
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
                setIsMobileMenuOpen(false);
              }}
            >
              {t("sidebar.dashboard")}
            </a>
            <a
              className={`p-2 rounded-lg ${
                location.pathname === "/send-receive"
                  ? "bg-primary/20 text-primary"
                  : "text-neutral-400 hover:text-[rgb(var(--navItem))]"
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/send-receive/send");
                setIsMobileMenuOpen(false);
              }}
            >
              {t("sidebar.sendReceive")}
            </a>
            <a
              className={`p-2 rounded-lg ${
                location.pathname === "/send-receive"
                  ? "bg-primary/20 text-primary"
                  : "text-neutral-400 hover:text-[rgb(var(--navItem))]"
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/swap");
                setIsMobileMenuOpen(false);
              }}
            >
              {t("sidebar.swap")}
            </a>
            <a
              className={`p-2 rounded-lg ${
                location.pathname === "/transactions"
                  ? "bg-primary/20 text-primary"
                  : "text-neutral-400 hover:text-[rgb(var(--navItem))]"
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/transactions");
                setIsMobileMenuOpen(false);
              }}
            >
              {t("sidebar.transactions")}
            </a>
            <a
              className={`p-2 rounded-lg ${
                location.pathname === "/transactions"
                  ? "bg-primary/20 text-primary"
                  : "text-neutral-400 hover:text-[rgb(var(--navItem))]"
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/support");
                setIsMobileMenuOpen(false);
              }}
            >
              {t("sidebar.support")}
            </a>
            <a
              className={`p-2 rounded-lg ${
                location.pathname === "/settings"
                  ? "bg-primary/20 text-primary"
                  : "text-neutral-400 hover:text-[rgb(var(--navItem))]"
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/settings");
                setIsMobileMenuOpen(false);
              }}
            >
              {t("sidebar.settings")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
