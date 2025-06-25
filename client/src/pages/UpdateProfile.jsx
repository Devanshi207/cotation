import React, { useContext, useState, useEffect } from "react";
import { useNavigate }       from "react-router-dom";
import { AuthContext }       from "../context/AuthContext";

/* simple user icon */
const UserIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 20.25a4.5 4.5 0 00-6 0M4.5 20.25a7.5 7.5 0 0115 0M12 11.25a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

export default function UpdateProfile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  /* pre‑fill user info */
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPreview(user.avatar || "/default_avatar.png");
    }
  }, [user]);

  /* handle avatar choose */
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const valid = ["image/jpeg", "image/png"];
    if (!valid.includes(f.type)) {
      setErr("Only JPG or PNG files are allowed.");
      e.target.value = "";   // reset input
      return;
    }
    setErr("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("avatar", file);

      await updateProfile(formData);         // AuthContext auto handles headers
      alert("Profile updated successfully!");
      navigate("/");
    } catch (er) {
      console.error(er);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#f5f9fa] dark:bg-slate-900 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-semibold mb-8 text-[#74bbbd] dark:text-teal-300">
          <UserIcon className="w-8 h-8" /> Update Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Avatar preview & picker */}
          <div className="flex items-center gap-4">
            <img
              src={preview}
              alt="avatar"
              className="h-20 w-20 rounded-full object-cover border"
            />

            <label className="flex flex-col">
              <span className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Change picture
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFile}
                className="text-sm"
              />
              {err && <span className="text-red-600 text-xs mt-1">{err}</span>}
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 py-2.5 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#74bbbd]"
            />
          </div>

          {/* Email (read‑only) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-transparent bg-gray-100 dark:bg-slate-700 py-2.5 px-3 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#74bbbd] hover:bg-[#5ba3a5] text-white py-2.5 font-semibold shadow transition-colors disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
