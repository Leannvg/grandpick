import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function createPrediction(prediction){
    return fetch(`${API_URL}/api/predictions`, {
        method: 'POST',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
        body: JSON.stringify(prediction)
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

            const error = new Error(errorData.message || 'Error al crear la predicción');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}


async function editPrediction(prediction, id){
    return fetch(`${API_URL}/api/predictions/${id}`, {
        method: 'PATCH',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
        body: JSON.stringify(prediction)
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

            const error = new Error(errorData.message || 'Error al editar la predicción');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function findPredictionByUserAndRace(userId, raceId){
    return fetch(`${API_URL}/api/users/${userId}/predictions/${raceId}`, {
        method: 'GET',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
     .then(async (response) => {
            if (response.ok) {
                return response.json()
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }
        })
}





export default {
    createPrediction,
    editPrediction,
    findPredictionByUserAndRace
}