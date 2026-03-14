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

export default {
    findByUser,
    markAsRead,
    markAllAsRead
}