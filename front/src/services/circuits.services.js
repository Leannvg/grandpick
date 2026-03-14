import API_URL, { apiFetch } from "./api.js";

async function find(){
    return apiFetch("/api/circuits");
}

async function findById(id){
    return apiFetch(`/api/circuits/${id}`);
}

async function create(circuit){
    return apiFetch("/api/circuits", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(circuit),
    });
}

async function edit(id, circuit){
    return apiFetch(`/api/circuits/${id}`, {
        method: 'PATCH',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(circuit),
    });
}

async function remove(id){
    return apiFetch(`/api/circuits/${id}`, {
        method: 'DELETE',
    });
}

export default {
    find,
    findById,
    create,
    edit,
    remove
}