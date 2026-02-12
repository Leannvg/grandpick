import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

const BASE_URL = `${API_URL}/api/notifications`;

export async function getMyNotifications() {
  const response = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener notificaciones");
  }

  return response.json();
}

export async function markAsSeen(id) {
  const response = await fetch(`${BASE_URL}/${id}/seen`, {
    method: "PATCH",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al marcar notificación como vista");
  }
}



export async function deleteNotification(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  if (!response.ok) {
    throw new Error("Error al eliminar notificación");
  }
}