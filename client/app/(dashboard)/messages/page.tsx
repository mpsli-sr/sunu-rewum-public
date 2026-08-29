"use client";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function MessagesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then(setCurrentUser)
      .catch((err) => console.warn("Erreur auth/me:", err));

    http
      .get<any[]>("/api/admin/users")
      .then(setUsers)
      .catch((err) => console.warn("Erreur admin/users:", err));
  }, []);

  const loadMessages = async (otherId: string) => {
    if (!currentUser) return;
    try {
      const data = await http.get<any[]>(
        `/api/messages/${currentUser.id}/${otherId}`,
      );
      setMessages(data);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!content || !selectedUser || !currentUser) return;
    try {
      await http.post("/api/messages", {
        content,
        senderId: currentUser.id,
        receiverId: selectedUser.id,
      });
      setContent("");
      await loadMessages(selectedUser.id);
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.firstName || "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex gap-6">
      <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <h2 className="font-bold mb-4">Contacts</h2>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Rechercher..."
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white text-sm"
        />
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {filteredUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                loadMessages(u.id);
              }}
              className={`w-full text-left p-2 rounded ${
                selectedUser?.id === u.id
                  ? "bg-green-100 dark:bg-green-900"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {u?.firstName ?? ""} {u?.lastName ?? ""}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col">
        <h2 className="font-bold mb-4">
          {selectedUser
            ? `Conversation avec ${selectedUser?.firstName ?? ""} ${
                selectedUser?.lastName ?? ""
              }`
            : "Sélectionnez un contact"}
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded ${
                m.senderId === currentUser?.id
                  ? "bg-green-100 dark:bg-green-900 self-end"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {m.content}
            </div>
          ))}
        </div>
        {selectedUser && (
          <div className="flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="Votre message..."
            />
            <button
              onClick={sendMessage}
              className="bg-brand-green text-white px-4 py-2 rounded"
            >
              Envoyer
            </button>
          </div>
        )}
      </div>
      <EditableBlockRenderer page="messages" />
    </div>
  );
}
