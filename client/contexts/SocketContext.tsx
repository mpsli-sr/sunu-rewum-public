"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  resetUnread: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  unreadCount: 0,
  resetUnread: () => {},
});

export function SocketProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const newSocket = io("https://sunu-rewum.onrender.com");
    newSocket.emit("join", userId);
    setSocket(newSocket);

    newSocket.on("new_message", () => {
      setUnreadCount((c) => c + 1);
    });
    newSocket.on("new_event", (data: any) => {
      // Toast simple
      console.log("🔔 Nouvel événement :", data.title);
    });
    newSocket.on("new_signature", (data: any) => {
      console.log("✍️ Nouvelle signature de :", data.userName);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const resetUnread = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, resetUnread }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
