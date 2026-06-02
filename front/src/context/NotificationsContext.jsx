import { createContext, useContext, useEffect, useState } from "react";
import NotificationsServices from "../services/notifications.services.js";
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

  const markAsSeen = async (id) => {
    try {
      await NotificationsServices.markAsSeen(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, seen: true } : n));
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const markAllAsSeen = async () => {
    try {
      await NotificationsServices.markAllAsSeen();
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
    } catch (error) {
      console.error("Error marking all notifications as seen:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await NotificationsServices.deleteAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  useEffect(() => {
    console.log("🔔 NotificationsContext userId:", userId);

    if (!userId) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    let currentSocket = null;
    const unsubscribe = onSocketReady((socket) => {
      console.log("🟢 ESCUCHANDO notifications:new");
      currentSocket = socket;
      socket.on("notifications:new", fetchNotifications);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (currentSocket) {
        currentSocket.off("notifications:new", fetchNotifications);
      }
    };
  }, [userId]);


  return (
    <NotificationsContext.Provider value={{ notifications, deleteNotification, markAsSeen, markAllAsSeen, deleteAllNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
