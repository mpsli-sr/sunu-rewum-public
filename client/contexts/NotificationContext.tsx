"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, "id" | "read">) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  markAllRead: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notif: Omit<Notification, "id" | "read">) => {
    const id = Date.now().toString();
    setNotifications((prev) => [{ ...notif, id, read: false }, ...prev]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const socket = getSocket();
    socket.on("new_event", (data: any) => {
      addNotification({
        message: `Nouvel événement : ${data.title}`,
        type: "info",
      });
    });
    socket.on("new_proposal", (data: any) => {
      addNotification({
        message: `Nouvelle proposition : ${data.title}`,
        type: "info",
      });
    });
    socket.on("new_message", (data: any) => {
      addNotification({
        message: `Nouveau message de ${data.senderName}`,
        type: "info",
      });
    });
    return () => {
      socket.off("new_event");
      socket.off("new_proposal");
      socket.off("new_message");
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
