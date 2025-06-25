import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Home,
  User as UserIcon,
  Handshake,
} from "lucide-react";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import logo from "../assets/logo.png";

export default function Sidebar({
  user,
  open,
  toggleSidebar,
  closeSidebar,
}) {
  const [openMaster, setOpenMaster] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openCRM, setOpenCRM] = useState(false);

  const expandOr = (fn) => (!open ? toggleSidebar() : fn());

  const displayName = user?.name || "";

  /* ---------- Master links (Project removed) ---------- */
  const masterLinks = [
    { label: "Aluminium", path: "/aluminium" },
    {label: "Finish", path: "/finish"},
    { label: "Glass", path: "/glass" },
    { label: "Hardware", path: "/hardware" },
    { label: "HSN/SAC Code", path: "/hsn-sac-code" },
    { label: "Lock", path: "/lock" },          // ✅ Lock kept
    { label: "Product", path: "/product" },
    { label: "Product Group", path: "/product-group" },
    { label: "Product Type", path: "/product-type" },
    { label: "Unit", path: "/unit" },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col shadow-md transition-all duration-300
        bg-white text-gray-800 dark:bg-black dark:text-white
        ${open ? "w-64 p-6" : "w-20 p-2 items-center"}
      `}
    >
      {/* Logo */}
      <div className={`mb-6 shrink-0 ${open ? "flex justify-start" : "flex justify-center"}`}>
        <img src={logo} alt="ACCORR Logo" className={open ? "h-25 w-36" : "h-12 w-17"} />
      </div>

      {/* Hamburger Icon */}
      <button
        onClick={toggleSidebar}
        className="mb-6 self-end text-gray-600 dark:text-gray-300 hover:text-[#74bbbd]"
        title={open ? "Collapse" : "Expand"}
      >
        {open ? (
          <svg width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4 shrink-0">
        {user?.avatar ? (
          <img src={user.avatar} alt={displayName} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        {open && displayName && (
          <span
            className="font-semibold"
            style={{ fontFamily: "Times New Roman, serif", fontSize: "20px" }}
          >
            {displayName}
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400">
        <ul className="space-y-3" style={{ fontFamily: "Times New Roman, serif" }}>
          
          {/* Dashboard */}
          <li onClick={() => expandOr(closeSidebar)}>
            <Link to="/" className="flex items-center gap-3 hover:text-[#74bbbd]">
              <Home size={22} />
              {open && <span className="text-[24px]">Dashboard</span>}
            </Link>
          </li>

          {/* CRM Dropdown (Quotation + Project) */}
          <li>
            <button
              onClick={() => (!open ? toggleSidebar() : setOpenCRM((p) => !p))}
              className="flex w-full items-center justify-between hover:text-[#74bbbd]"
            >
              <div className="flex items-center gap-3">
                <Handshake size={22} />
                {open && <span className="text-[24px]">CRM</span>}
              </div>
              {open && (openCRM ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
            </button>
            {open && openCRM && (
              <ul className="mt-2 ml-4 space-y-1">
                <li onClick={() => expandOr(closeSidebar)}>
                  <Link to="/project" className="block text-[22px] hover:text-[#74bbbd]">
                    Project
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Master Dropdown */}
          <li>
            <button
              onClick={() => (!open ? toggleSidebar() : setOpenMaster((p) => !p))}
              className="flex w-full items-center justify-between hover:text-[#74bbbd]"
            >
              <div className="flex items-center gap-3">
                📦
                {open && <span className="text-[24px]">Master</span>}
              </div>
              {open && (openMaster ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
            </button>
            {open && openMaster && (
              <ul className="mt-2 ml-4 space-y-1">
                {masterLinks.map(({ label, path }) => (
                  <li key={label} onClick={() => expandOr(closeSidebar)}>
                    <Link to={path} className="block text-[22px] hover:text-[#74bbbd]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Profile Dropdown */}
          <li>
            <button
              onClick={() => (!open ? toggleSidebar() : setOpenProfile((p) => !p))}
              className="flex w-full items-center justify-between hover:text-[#74bbbd]"
            >
              <div className="flex items-center gap-3">
                👤
                {open && <span className="text-[24px]">Profile</span>}
              </div>
              {open && (openProfile ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
            </button>

            {open && openProfile && (
              <ul className="ml-4 mt-2 space-y-1">
                <li onClick={() => expandOr(closeSidebar)}>
                  <Link to="/update-profile" className="block text-[22px] hover:text-[#74bbbd]">
                    Update Profile
                  </Link>
                </li>
                <li onClick={() => expandOr(closeSidebar)}>
                  <Link to="/change-password" className="block text-[22px] hover:text-[#74bbbd]">
                    Change Password
                  </Link>
                </li>
                <li>
                  <LogoutButton afterLogout={closeSidebar} extraClasses="text-[22px]" />
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}
