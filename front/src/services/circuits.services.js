import API_URL, { apiFetch } from "./api.js";

async function findAll(){
    return apiFetch("/api/circuits");
}

async function findOne(id){
    return apiFetch(`/api/circuits/${id}`);
}

async function createCircuit(circuit){
    return apiFetch("/api/circuits", {
        method: 'POST',
        body: circuit instanceof FormData ? circuit : JSON.stringify(circuit),
        headers: circuit instanceof FormData ? {} : { "Content-type": "application/json" }
    });
}

async function updateCircuit(id, circuit){
    return apiFetch(`/api/circuits/${id}`, {
        method: 'PATCH',
        body: circuit instanceof FormData ? circuit : JSON.stringify(circuit),
        headers: circuit instanceof FormData ? {} : { "Content-type": "application/json" }
    });
}

async function deleteCircuit(id){
    return apiFetch(`/api/circuits/${id}`, {
        method: 'DELETE',
    });
}

export default {
    findAll,
    findById: findOne,
    findOne,
    createCircuit,
    create: createCircuit,
    updateCircuit,
    edit: updateCircuit,
    deleteCircuit,
    remove: deleteCircuit
}