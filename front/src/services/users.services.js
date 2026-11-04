import API_URL, { apiFetch } from "./api.js";

async function findAll() {
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

// Caché en memoria a nivel de módulo (mismo idioma que countries.services.js, sin localStorage:
// estos datos cambian durante el fin de semana de carrera y no debe sobrevivir a días con la
// pestaña cerrada). Se limpia sola en cada F5, lo que alcanza como invalidación.
let cachedGlobalRankingPromise = null;

async function getGlobalRanking() {
    if (cachedGlobalRankingPromise) return cachedGlobalRankingPromise;
    cachedGlobalRankingPromise = apiFetch("/api/ranking/global").catch((err) => {
        cachedGlobalRankingPromise = null;
        throw err;
    });
    return cachedGlobalRankingPromise;
}

function invalidateGlobalRankingCache() {
    cachedGlobalRankingPromise = null;
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
    findAll,
    findById,
    update,
    remove,
    getUserProfile,
    getUserStats,
    getAllUsersStats,
    getGlobalRanking,
    invalidateGlobalRankingCache,
    blockUser,
    unblockUser,
    updateSecurity
}