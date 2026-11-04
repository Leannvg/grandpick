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

// Caché en memoria a nivel de módulo, keyed por circuito+año (mismo idioma que
// countries.services.js / users.services.js:getGlobalRanking).
const cachedGrandPrixRankingPromises = {};

async function getGrandPrixRanking(circuitId, year) {
    const key = `${circuitId}_${year}`;
    if (cachedGrandPrixRankingPromises[key]) return cachedGrandPrixRankingPromises[key];

    cachedGrandPrixRankingPromises[key] = apiFetch(`/api/ranking/circuit/${circuitId}/year/${year}`)
        .catch((err) => {
            delete cachedGrandPrixRankingPromises[key];
            throw err;
        });
    return cachedGrandPrixRankingPromises[key];
}

function invalidateGrandPrixRankingCache(circuitId, year) {
    if (circuitId && year) {
        delete cachedGrandPrixRankingPromises[`${circuitId}_${year}`];
    } else {
        Object.keys(cachedGrandPrixRankingPromises).forEach((k) => delete cachedGrandPrixRankingPromises[k]);
    }
}

export default {
    createPrediction,
    editPrediction,
    findPredictionByUserAndRace,
    findHistoryByUser,
    getGrandPrixRanking,
    invalidateGrandPrixRankingCache
}