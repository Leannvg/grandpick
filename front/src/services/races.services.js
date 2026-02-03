import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function findAll(){
    return fetch(`${API_URL}/api/races`,{
        method: 'GET',
        headers: {
            "Content-type": "application/json",
        },
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudieron obtener las carreras')
        }
    })
}

async function findAllByYear(year){
    return fetch(`${API_URL}/api/races/year/${year}`,{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudieron obtener las carreras')
        }
    })
}

async function findById(idRace){
    return fetch(`${API_URL}/api/races/${idRace}`,{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudo obtener la carrera')
        }
    })
}

async function findCurrentOrNext(){
    return fetch(`${API_URL}/api/races/current-or-next`,{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudo obtener la siguiente carrera')
        }
    })
}

async function findByCircuitAndYear(circuitId, year){
    return fetch(`${API_URL}/api/races/circuit/${circuitId}/year/${year}`,{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudo obtener carreras para el circuito')
        }
    })
}


async function createRace(objCircuit){
    console.log("Creating race with data:", objCircuit);
    return fetch(`${API_URL}/api/races`,{
        method: 'POST',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
        body: JSON.stringify(objCircuit),
    })
    .then(async (response) => {
        if (response.ok){
            return response.json()
        }
        else {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: await response.text() };
            }

            const error = new Error(errorData.message || 'Error al crear la carrera');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function updateRace(idRace, objRace){
    return fetch(`${API_URL}/api/races/${idRace}`,{
        method: 'PATCH',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
        body: JSON.stringify(objRace),
    })
    .then(async (response) => {
        if (response.ok){
            return response.json()
        }
        else {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: await response.text() };
            }

            const error = new Error(errorData.message || 'Error al editar la carrera');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function deleteRace(idRace){
    return fetch(`${API_URL}/api/races/${idRace}`,{
        method: 'DELETE',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudo eliminar la carrera')
        }
    })
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