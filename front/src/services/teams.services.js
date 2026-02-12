import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function findAllTeams() {
    return fetch(`${API_URL}/api/teams`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
        }
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

async function createTeam(formData){
    return fetch(`${API_URL}/api/teams`, {
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

            const error = new Error(errorData.message || 'Error al crear el equipo');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function findTeamById(teamId){
    return fetch(`${API_URL}/api/teams/${teamId}`, {
        method: 'GET', 
        headers: {
            'Content-type': 'application/json',
        }
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

async function editTeam(teamId, formData){
    return fetch(`${API_URL}/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: formData, // 👈 FormData directo
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

            const error = new Error(errorData.message || 'Error al editar el equipo');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function editDashboardTeam(teamId, team){
    return fetch(`${API_URL}/api/dashboard/teams/${teamId}`, {
        method: 'PATCH',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
        body: JSON.stringify(team)
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

            const error = new Error(errorData.message || 'Error al editar el equipo en dashboard');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function deleteTeam(teamId){
    return fetch(`${API_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
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
    findAllTeams,
    createTeam,
    findTeamById,
    editTeam,
    editDashboardTeam,
    deleteTeam
}