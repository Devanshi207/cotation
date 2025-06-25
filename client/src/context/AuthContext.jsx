import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

/* ── Axios instance ─────────────────────────── */
const api = axios.create({ baseURL: "http://localhost:5000/api/auth" });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* ── Provider ───────────────────────────────── */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user,  setUser]  = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  /* keep localStorage in sync */
  useEffect(() => {
    token ? localStorage.setItem("token", token) : localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    user ? localStorage.setItem("user", JSON.stringify(user)) : localStorage.removeItem("user");
  }, [user]);

  /* ── Auth helpers ─────────────────────────── */
  const signup = async (name, email, password) => {
    const { data } = await api.post("/signup", { name, email, password });
    setUser(data.user);
    setToken(data.token);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    setUser(data.user);
    setToken(data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  /* ── Profile helpers ──────────────────────── */
  /**
   * updates: either a plain object (JSON) OR a FormData instance
   * containing fields like `name`, and optional `avatar` file
   */
  const updateProfile = async (updates) => {
    const isForm = updates instanceof FormData;
    const config  = isForm ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const { data } = await api.put("/profile", updates, config);
    setUser(data.user);                 // refresh context
    return data.user;
  };

  const changePassword = async (currentPw, newPw) =>
    api.put("/password", { currentPw, newPw });

  return (
    <AuthContext.Provider
      value={{ user, token, signup, login, logout, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
