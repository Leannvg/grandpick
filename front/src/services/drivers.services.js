import API_URL, { apiFetch } from "./api.js";

async function findAll(){
    return apiFetch("/api/drivers");
}

async function findDriverById(id){
    return apiFetch(`/api/drivers/${id}`);
}

async function createDriver(driver){
    return apiFetch("/api/drivers", {
        method: 'POST',
        body: driver instanceof FormData ? driver : JSON.stringify(driver),
        headers: driver instanceof FormData ? {} : { "Content-type": "application/json" }
    });
}

async function editDriver(id, driver){
    return apiFetch(`/api/drivers/${id}`, {
        method: 'PATCH',
        body: driver instanceof FormData ? driver : JSON.stringify(driver),
        headers: driver instanceof FormData ? {} : { "Content-type": "application/json" }
    });
}

async function deleteDriver(id){
    return apiFetch(`/api/drivers/${id}`, {
        method: 'DELETE',
    });
}

async function checkDriverUsedInRaces(id) {
    return apiFetch(`/api/drivers/${id}/used`);
}

async function enableDriver(id) {
    return apiFetch(`/api/drivers/${id}/enabled`, {
        method: 'PATCH'
    });
}

async function disableDriver(id) {
    return apiFetch(`/api/drivers/${id}/disabled`, {
        method: 'PATCH'
    });
}

export default {
    findAll,
    find: findAll,
    findDriverById,
    findById: findDriverById,
    createDriver,
    create: createDriver,
    editDriver,
    edit: editDriver,
    deleteDriver,
    remove: deleteDriver,
    checkDriverUsedInRaces,
    enableDriver,
    disableDriver
}