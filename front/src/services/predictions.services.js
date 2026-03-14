import API_URL, { apiFetch } from "./api.js";

async function createPrediction(prediction) {
    return apiFetch("/api/predictions", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(prediction)
    });
}

async function editPrediction(prediction, id) {
    return apiFetch(`/api/predictions/${id}`, {
        method: 'PATCH',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(prediction)
    });
}

async function findPredictionByUserAndRace(userId, raceId) {
    return apiFetch(`/api/users/${userId}/predictions/${raceId}`);
}

async function findHistoryByUser(userId, year) {
    return apiFetch(`/api/users/${userId}/predictions-history?year=${year}`);
}

export default {
    createPrediction,
    editPrediction,
    findPredictionByUserAndRace,
    findHistoryByUser
}