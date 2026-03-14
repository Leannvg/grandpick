import API_URL, { apiFetch } from "./api.js";

async function find(){
    return apiFetch("/api/drivers");
}

async function findById(id){
    return apiFetch(`/api/drivers/${id}`);
}

async function create(driver){
    return apiFetch("/api/drivers", {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(driver),
    });
}

async function edit(id, driver){
    return apiFetch(`/api/drivers/${id}`, {
        method: 'PATCH',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(driver),
    });
}

async function remove(id){
    return apiFetch(`/api/drivers/${id}`, {
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