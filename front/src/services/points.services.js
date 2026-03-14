import API_URL, { apiFetch } from "./api.js";

async function findAll() {
    return apiFetch("/api/points");
}

async function findByRace(raceId) {
    return apiFetch(`/api/races/${raceId}/points`);
}

async function findByUser(userId, year) {
    return apiFetch(`/api/users/${userId}/points?year=${year}`);
}

export default {
    findAll,
    findByRace,
    findByUser
}