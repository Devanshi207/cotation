import React, { useState, useContext } from "react";
import { Outlet }       from "react-router-dom";
import Sidebar          from "./Sidebar";
import Topbar           from "./Topbar";
import { AuthContext }  from "../context/AuthContext";   // ← NEW

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);              // ← current user

  return (
    <div className="relative min-h-screen flex bg-white text-black dark:bg-black dark:text-white">
      {/* ── Sidebar ───────────────────────────────────── */}
      <Sidebar
        user={user}                                       // ← pass user down
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main column ──────────────────────────────── */}
      <div
        className={`
          flex flex-col flex-1 min-h-screen
          transition-[padding] duration-300
          ${sidebarOpen ? "md:pl-64" : "md:pl-20"}
        `}
      >
        <Topbar
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
