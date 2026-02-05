import http from "http";
import { Server } from "socket.io";
import app from "./express.js";
import "./jobs/predictionsOpenNotification.job.js";

const PORT = process.env.PORT || 2022;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Hacemos disponible io para los controllers
app.set("io", io);

// 🔑 hacer app accesible para cron jobs
global.app = app;

io.on("connection", (socket) => {
  const userId = socket.handshake.auth?.userId;
  console.log("USER ID SOCKET:", userId);

  if (userId) {
    socket.join(`user:${userId}`);
    console.log("🏠 JOIN ROOM:", `user:${userId}`);
  }

  socket.on("disconnect", () => {
    // opcional
  });
});

server.listen(PORT, () => {
  console.log(`Servidor F1 iniciado en puerto ${PORT}`);
});
