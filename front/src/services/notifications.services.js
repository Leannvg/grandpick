import API_URL, { apiFetch } from "./api.js";

async function findByUser(userId) {
    return apiFetch(`/api/users/${userId}/notifications`);
}

async function markAsRead(userId, notificationId) {
    return apiFetch(`/api/users/${userId}/notifications/${notificationId}/read`, {
        method: 'POST',
    });
}

async function markAllAsRead(userId) {
    return apiFetch(`/api/users/${userId}/notifications/read-all`, {
        method: 'POST',
    });
}

async function getMyNotifications() {
    return apiFetch("/api/notifications/me");
}

async function deleteNotification(id) {
    return apiFetch(`/api/notifications/${id}`, {
        method: 'DELETE',
    });
}

export default {
    findByUser,
    markAsRead,
    markAllAsRead,
    getMyNotifications,
    deleteNotification
}