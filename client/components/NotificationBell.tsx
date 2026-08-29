"use client";
import { useNotifications } from "@/contexts/NotificationContext";
import { useState } from "react";

export default function NotificationBell() {
  const { notifications, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (open) markAllRead();
        }}
        className="relative text-xl"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2 border-b dark:border-gray-700 flex justify-between items-center">
            <span className="font-bold text-sm">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-brand-green">
              Tout lu
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2 border-b dark:border-gray-700 text-sm ${n.read ? "opacity-60" : "font-medium"}`}
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
