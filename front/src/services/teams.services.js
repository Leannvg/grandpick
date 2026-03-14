import API_URL, { apiFetch } from "./api.js";

async function find(){
    return apiFetch("/api/teams");
}

async function findById(id){
    return apiFetch(`/api/teams/${id}`);
}

async function create(team){
    return apiFetch("/api/teams", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(team),
    });
}

async function edit(id, team){
    return apiFetch(`/api/teams/${id}`, {
        method: 'PATCH',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(team),
    });
}

async function remove(id){
    return apiFetch(`/api/teams/${id}`, {
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