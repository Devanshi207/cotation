import React, { createContext, useContext, useEffect, useState } from "react";

/* -------------------------------------------------------- */
/* Hook + Provider                                          */
/* -------------------------------------------------------- */

const NotificationContext = createContext({ notifs: [], loading: true });
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔁 poll every 60 s — swap out for WebSocket/SSE if you like */
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("/api/notifications");
        const data = await res.json();
        setNotifs(data);
      } catch (err) {
        console.error("Notification fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifs, loading, setNotifs }}>
      {children}
    </NotificationContext.Provider>
  );
};
