import { createContext, useContext, useEffect, useState } from "react";
import * as NotificationsServices from "../services/notifications.services.js";
import { onSocketReady } from "../socket";

const NotificationsContext = createContext();

export function NotificationsProvider({ children, userId }) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    console.log("📥 FETCHING NOTIFICATIONS");
    const data = await NotificationsServices.getMyNotifications();
    setNotifications(data);
  };

  const deleteNotification = async (id) => {
    await NotificationsServices.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    console.log("🔔 NotificationsContext userId:", userId);

    if (!userId) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    const unsubscribe = onSocketReady((socket) => {
      console.log("🟢 ESCUCHANDO notifications:new");
      socket.on("notifications:new", fetchNotifications);
    });

    return () => {
      unsubscribe?.();
    };
  }, [userId]);


  return (
    <NotificationsContext.Provider value={{ notifications, deleteNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
