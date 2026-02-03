import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function find(){
    return fetch(`${API_URL}/api/users`,{
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
            throw new Error ('No se pudo obtener los usuarios')
        }
    })
}

async function findById(id){
    return fetch(`${API_URL}/api/users/${id}`,{
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
            throw new Error ('No se pudo obtener el usuario')
        }
    })
}

async function updateSecurity(id, data) {
  return fetch(`${API_URL}/api/users/${id}/security`, {
    method: "PATCH",
    headers: authHeaders({
      "Content-type": "application/json",
    }),
    body: JSON.stringify(data)
  })
  .then(async (response) => {
    if (response.ok) return response.json();

    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: await response.text() };
    }

    const error = new Error(errorData.message || 'Error al actualizar');
    error.response = { status: response.status, data: errorData };
    throw error;
  });
}



async function update(id, formData) {
    return fetch(`${API_URL}/api/users/${id}`, {
        method: "PATCH",
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
                errorData = { message: await response.json() };
            }

            const error = new Error(errorData.message || 'Error al actualizar el usuario');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function remove(user, id) {
    return fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
        body: JSON.stringify(user)
    })
        .then(response => response.json())
}


async function getUserProfile() {
    return fetch(`${API_URL}/api/user/profile`, {
        method: 'GET',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
        .then(response => response.json())
}

async function getUserStats(id) {
    return fetch(`${API_URL}/api/users/${id}/stats`, {
        method: 'GET',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
        .then(response => response.json())
}

async function getAllUsersStats() {
    return fetch(`${API_URL}/api/users-stats`, {
        method: 'GET',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
        .then(response => response.json())
}
   
async function blockUser(id) {
    return fetch(`${API_URL}/api/users/${id}/block`, {
        method: 'POST',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
        .then(response => response.json())
}

async function unblockUser(id) {
    return fetch(`${API_URL}/api/users/${id}/unblock`, {
        method: 'POST',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
        .then(response => response.json())
}



export default {
    find,
    findById,
    update,
    remove,
    getUserProfile,
    getUserStats,
    getAllUsersStats,
    blockUser,
    unblockUser,
    updateSecurity
}