import API_URL, { apiFetch } from "./api.js";

async function findAll(){
    return apiFetch("/api/races");
}

async function findAllByYear(year){
    return apiFetch(`/api/races/year/${year}`);
}

async function findById(idRace){
    return apiFetch(`/api/races/${idRace}`);
}

async function findCurrentOrNext(){
    return apiFetch("/api/races/current-or-next");
}

async function findByCircuitAndYear(circuitId, year){
    return apiFetch(`/api/races/circuit/${circuitId}/year/${year}`);
}


async function createRace(objCircuit){
    return apiFetch("/api/races", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(objCircuit),
    });
}

async function updateRace(idRace, objRace){
    return apiFetch(`/api/races/${idRace}`, {
        method: 'PATCH',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(objRace),
    });
}

async function deleteRace(idRace){
    return apiFetch(`/api/races/${idRace}`, {
        method: 'DELETE',
    });
}

export default {
    findAll,
    findAllByYear,
    findByCircuitAndYear,
    findById,
    findCurrentOrNext,
    createRace,
    updateRace,
    deleteRace
}