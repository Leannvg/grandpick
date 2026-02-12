import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function findAll(){
    return fetch(`${API_URL}/api/points`,{
        method: 'GET',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudieron obtener los tipos de puntaje.')
        }
    })
}

export default {
    findAll
}