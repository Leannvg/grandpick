import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

async function login(email, password){
    return fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({email, password})
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

            const error = new Error(errorData.message || 'Error al iniciar sesión');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    })
}

async function logout(){
    return fetch(`${API_URL}/api/users/logout`, {
        method: 'POST',
        headers: authHeaders({
            'Content-type': 'application/json',
        }),
    })
        .then(res=> {
            if(res.ok){
                return res.json()
            }
            else {
                throw new Error('No fue posible cerrar sesión')
            }
        })
}

async function register(name, last_name, country, email, password){
    console.log(JSON.stringify({name, last_name, country, email, password}))
    return fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({name, last_name, country, email, password})
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

            const error = new Error(errorData.message || 'Error al registrar usuario');
            error.response = { status: response.status, data: errorData };
            throw error;
        }
    }) 
    .catch((error) => {
        throw error;
    })
}

async function forgotPassword(email) {
  return fetch(`${API_URL}/api/users/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })
    .then(res => res.json());
}

async function resetPassword(token, password) {
  return fetch(`${API_URL}/api/users/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  })
    .then(async res => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      return res.json();
    });
}



export {
    login,
    logout,
    register,
    forgotPassword,
    resetPassword
}