import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Utilisateur connecté : " + socket.id);

    // Rejoindre une room personnelle basée sur l'ID utilisateur (fourni lors de l'auth)
    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`👤 ${userId} a rejoint sa room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Utilisateur déconnecté : " + socket.id);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io non initialisé");
  return io;
}
