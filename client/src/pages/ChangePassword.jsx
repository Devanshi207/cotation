import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

// A light icon for visual feedback (Heroicons)
const LockClosedIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V9a4.5 4.5 0 10-9 0v1.5m9 0H7.5m9 0a2.25 2.25 0 012.25 2.25v5.25A2.25 2.25 0 0116.5 20.25h-9A2.25 2.25 0 015.25 18V12.75A2.25 2.25 0 017.5 10.5m9 0h-9"
    />
  </svg>
);

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { token } = useContext(AuthContext);

  const handleChange = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/api/auth/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update password.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#f5f9fa] dark:bg-slate-900 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-semibold text-center mb-8 text-[#74bbbd] dark:text-teal-300">
          Change Password
        </h1>

        <form onSubmit={handleChange} className="space-y-6">
          {/* Current password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Current Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 py-2.5 pl-10 pr-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#74bbbd]"
              />
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 py-2.5 pl-10 pr-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#74bbbd]"
              />
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#74bbbd] hover:bg-[#5ba3a5] text-white py-2.5 font-semibold shadow transition-colors disabled:opacity-60"
          >
            Change Password
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChangePassword;
