import API_URL, { apiFetch } from "./api.js";

async function findAllTeams(){
    return apiFetch("/api/teams");
}

async function findTeamById(id){
    return apiFetch(`/api/teams/${id}`);
}

async function findConstructorsStandings(year){
    return apiFetch(`/api/standings/constructors?year=${year}`);
}

async function createTeam(team){
    return apiFetch("/api/teams", {
        method: 'POST',
        body: team instanceof FormData ? team : JSON.stringify(team),
        headers: team instanceof FormData ? {} : { "Content-type": "application/json" }
    });
}

async function editTeam(id, team){
    return apiFetch(`/api/teams/${id}`, {
        method: 'PATCH',
        body: team instanceof FormData ? team : JSON.stringify(team),
        headers: team instanceof FormData ? {} : { "Content-type": "application/json" }
    });
}

async function deleteTeam(id){
    return apiFetch(`/api/teams/${id}`, {
        method: 'DELETE',
    });
}

export default {
    findAllTeams,
    findAll: findAllTeams,
    findTeamById,
    findById: findTeamById,
    findConstructorsStandings,
    createTeam,
    create: createTeam,
    editTeam,
    edit: editTeam,
    deleteTeam,
    remove: deleteTeam
}