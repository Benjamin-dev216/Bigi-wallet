import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background text-white ">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:w-64 lg:w-72">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(var(--background))]">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-1 md:p-6 flex-col ">
          <div className="container mx-auto max-w-6xl flex-1 ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
