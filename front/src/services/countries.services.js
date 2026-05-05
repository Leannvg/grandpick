const API_BASE = "https://api.countrystatecity.in/v1";

const headers = new Headers({
    "X-CSCAPI-KEY": import.meta.env.VITE_API_COUNTRIES
});

const requestOptions = {
    method: "GET",
    headers,
};

// --- In-Memory Cache ---
let cachedCountries = null;
const cachedOneCountry = {};
const cachedStatesByCountry = {};
const cachedStateDetails = {};

async function getCountries() {
    if (cachedCountries) return cachedCountries;

    const res = await fetch(`${API_BASE}/countries`, requestOptions);
    const data = await res.json();
    cachedCountries = data;
    return data;
}

async function getOneCountry(countryIso2) {
    if (!countryIso2) return null;
    if (cachedOneCountry[countryIso2]) return cachedOneCountry[countryIso2];

    const res = await fetch(`${API_BASE}/countries/${countryIso2}`, requestOptions);
    const data = await res.json();
    cachedOneCountry[countryIso2] = data;
    return data;
}

async function getStatesByCountry(countryIso2) {
    if (!countryIso2) return [];
    if (cachedStatesByCountry[countryIso2]) return cachedStatesByCountry[countryIso2];

    const res = await fetch(`${API_BASE}/countries/${countryIso2}/states`, requestOptions);
    const data = await res.json();
    cachedStatesByCountry[countryIso2] = data;
    return data;
}

async function getStateDetails(countryIso2, stateIso2) {
    if (!countryIso2 || !stateIso2) return null;
    const key = `${countryIso2}-${stateIso2}`;
    if (cachedStateDetails[key]) return cachedStateDetails[key];

    const res = await fetch(
        `${API_BASE}/countries/${countryIso2}/states/${stateIso2}`,
        requestOptions
    );
    const data = await res.json();
    cachedStateDetails[key] = data;
    return data;
}

export {
    getCountries,
    getOneCountry,
    getStatesByCountry,
    getStateDetails,
};