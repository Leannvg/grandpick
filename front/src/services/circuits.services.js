import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function findAll(){
    return fetch(`${API_URL}/api/circuits`,{
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
            throw new Error ('No se pudieron obtener los circuitos')
        }
    })
}

async function findOne(idCircuit){
    return fetch(`${API_URL}/api/circuits/${idCircuit}`,{
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
            throw new Error ('No se pudo obtener el circuito')
        }
    })
}

async function create(formData){
    return fetch(`${API_URL}/api/circuits`,{
        method: 'POST',
        headers: authHeaders(),
        body: formData,
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

            const error = new Error(errorData.message || 'Error al crear el circuito');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function deleteCircuit(idCircuit){
    return fetch(`${API_URL}/api/circuits/${idCircuit}`,{
        method: 'DELETE',
        headers: authHeaders(),
    }) 
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudo eliminar el circuito')
        }
    })
}

async function updateCircuit(idCircuit, formData){
    return fetch(`${API_URL}/api/circuits/${idCircuit}`,{
        method: 'PATCH',
         headers: authHeaders(),
        body: formData,
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

            const error = new Error(errorData.message || 'Error al editar el circuito');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}



export default {
    findAll,
    findOne,
    create,
    deleteCircuit,
    updateCircuit
}