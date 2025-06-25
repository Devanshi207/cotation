import React, { useState, useEffect, useRef, useContext } from "react";
import { Sun, Moon, Bell } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useNotifications } from "../context/NotificationContext";

export default function Topbar({ sidebarOpen, toggleSidebar }) {
  /* ───────── theme (persistent) ───────── */
  const [dark, setDark] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  /* ───────── notifications ───────────── */
  const { notifs, loading } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const panelRef = useRef(null);

  /* click‑outside / Esc to close notif panel */
  useEffect(() => {
    const clickOutside = (e) =>
      showNotif && panelRef.current && !panelRef.current.contains(e.target) && setShowNotif(false);
    const handleEsc = (e) => e.key === "Escape" && setShowNotif(false);
    document.addEventListener("mousedown", clickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showNotif]);

  return (
    <header
      className="
        h-14 flex items-center gap-4 px-4 lg:px-8 shadow-md
        bg-white text-gray-800
        dark:bg-black dark:text-white
      "
    >
      {/* hamburger – visible on mobile */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        {/* simple three‑lines icon */}
        <svg width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M3 6h14M3 12h14M3 18h14" />
        </svg>
      </button>

      {/* search */}
      <input
        type="text"
        placeholder="Search..."
        className="
          border px-3 py-1 rounded-md flex-1 max-w-xs
          dark:border-gray-700 dark:bg-[#111] dark:text-white
        "
      />

      {/* right‑hand buttons */}
      <div className="flex items-center gap-4 ml-auto">
        {/* theme toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800"
          title="Toggle theme"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* notifications */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowNotif((s) => !s)}
            className="relative rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800"
            title="Notifications"
          >
            <Bell size={20} />
            {!loading && notifs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-[5px]">
                {notifs.length}
              </span>
            )}
          </button>

          {/* dropdown */}
          {showNotif && (
            <div
              className="
                absolute right-0 mt-2 w-80 max-h-80 overflow-hidden rounded-lg
                bg-white dark:bg-[#111] text-gray-800 dark:text-white
                border border-gray-200 dark:border-gray-700 shadow-lg
              "
            >
              <div className="px-4 py-2 font-semibold border-b dark:border-gray-700">
                Notifications
              </div>
              {loading ? (
                <div className="p-4 text-center">Loading…</div>
              ) : (
                <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {notifs.length ? (
                    notifs.map((n) => (
                      <li
                        key={n.id}
                        className="px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setShowNotif(false)}
                      >
                        {n.text}
                      </li>
                    ))
                  ) : (
                    <li className="p-6 text-center text-gray-500">
                      No new notifications
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* logout */}
        <LogoutButton />
      </div>
    </header>
  );
}
