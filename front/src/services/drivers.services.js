import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function findAll(){
    return fetch(`${API_URL}/api/drivers`,{
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
            throw new Error ('No se pudieron obtener los pilotos')
        }
    })
}

async function createDriver(formData) {
  return fetch(`${API_URL}/api/drivers`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
  .then(async (response) => {
    if (response.ok) {
      return response.json();
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }

      const error = new Error(errorData.message || 'Error al crear piloto');
      error.response = { status: response.status, data: errorData };
      throw error;
    }
  });
}

async function editDriver(driverId, formData) {
  return fetch(`${API_URL}/api/drivers/${driverId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: formData,
  })
  .then(async (response) => {
    if (response.ok) {
      return response.json();
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }

      const error = new Error(errorData.message || 'Error al editar piloto');
      error.response = { status: response.status, data: errorData };
      throw error;
    }
  });
}


async function editDashboardDriver(driverId, driver) {
    return fetch(`${API_URL}/api/dashboard/drivers/${driverId}`,{
        method: 'PATCH',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
        body: JSON.stringify(driver),
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

            const error = new Error(errorData.message || 'Error al editar piloto en el dashboard');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}


async function findDriverById(driverId){
    return fetch(`${API_URL}/api/drivers/${driverId}`,{
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
            throw new Error ('No se pudo obtener el piloto')
        }
    })
}

async function deleteDriver(driverId){
    return fetch(`${API_URL}/api/drivers/${driverId}`,{
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
            throw new Error ('No se pudo eliminar el piloto')
        }
    })
}

async function checkDriverUsedInRaces(driverId){
    return fetch(`${API_URL}/api/drivers/${driverId}/used`,{
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
            throw new Error ('No se pudo verificar si el piloto está usado en carreras')
        }
    })
}

async function enableDriver(driverId){
    return fetch(`${API_URL}/api/drivers/${driverId}/enabled`,{
        method: 'PATCH',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    })
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudo habilitar el piloto')
        }
    })
}

async function disableDriver(driverId){
    return fetch(`${API_URL}/api/drivers/${driverId}/disabled`,{
        method: 'PATCH',
        headers: authHeaders({
            "Content-type": "application/json",
        }),
    }) 
    .then(response => {
        if (response.ok){
            return response.json()
        }
        else {
            throw new Error ('No se pudo deshabilitar el piloto')
        }
    })
}




export default {
    findAll,
    createDriver,
    deleteDriver,
    editDriver,
    editDashboardDriver,
    findDriverById,
    checkDriverUsedInRaces,
    enableDriver,
    disableDriver
}