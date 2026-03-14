import API_URL, { apiFetch } from "./api.js";

async function find() {
    return apiFetch("/api/users");
}

async function findById(id) {
    return apiFetch(`/api/users/${id}`);
}

async function updateSecurity(id, data) {
    return apiFetch(`/api/users/${id}/security`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json" }
    });
}

async function update(id, formData) {
    return apiFetch(`/api/users/${id}`, {
        method: "PATCH",
        body: formData,
    });
}

async function remove(user, id) {
    return apiFetch(`/api/users/${id}`, {
        method: 'DELETE',
        body: JSON.stringify(user),
        headers: { "Content-type": "application/json" }
    });
}

async function getUserProfile() {
    return apiFetch("/api/user/profile");
}

async function getUserStats(id) {
    return apiFetch(`/api/users/${id}/stats`);
}

async function getAllUsersStats() {
    return apiFetch("/api/users-stats");
}

async function blockUser(id) {
    return apiFetch(`/api/users/${id}/block`, {
        method: 'POST',
    });
}

async function unblockUser(id) {
    return apiFetch(`/api/users/${id}/unblock`, {
        method: 'POST',
    });
}

export default {
    find,
    findById,
    update,
    remove,
    getUserProfile,
    getUserStats,
    getAllUsersStats,
    blockUser,
    unblockUser,
    updateSecurity
}