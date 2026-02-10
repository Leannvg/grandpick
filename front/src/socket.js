import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

let socket = null;
let listeners = [];

export function connectSocket(userId) {
  if (socket) return socket;

  socket = io(API_URL, {
    auth: { userId },
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("🟢 SOCKET CONECTADO:", socket.id);

    listeners.forEach(cb => cb(socket));
    listeners = [];
  });

  socket.on("disconnect", () => {
    console.log("🔴 SOCKET DESCONECTADO");
  });

  return socket;
}

export function onSocketReady(cb) {
  if (socket) {
    cb(socket);
    return () => socket.off("notifications:new", cb);
  }

  listeners.push(cb);

  return () => {
    listeners = listeners.filter(l => l !== cb);
  };
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
