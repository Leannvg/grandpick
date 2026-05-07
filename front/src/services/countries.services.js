const API_BASE = "https://api.countrystatecity.in/v1";

const headers = new Headers({
    "X-CSCAPI-KEY": import.meta.env.VITE_API_COUNTRIES
});

const requestOptions = {
    method: "GET",
    headers,
};

// --- In-Memory Cache ---
let cachedCountriesPromise = null;
const cachedOneCountryPromises = {};
const cachedStatesPromises = {};
const cachedStateDetailsPromises = {};

async function getCountries() {
    if (cachedCountriesPromise) {
        console.log("💎 [Cache] Cargando lista de países desde la memoria");
        return cachedCountriesPromise;
    }

    console.log("🌐 [API] Pidiendo lista de países a la API externa por primera vez...");
    cachedCountriesPromise = fetch(`${API_BASE}/countries`, requestOptions)
        .then(res => res.json())
        .catch(err => {
            console.error("❌ [API] Error al pedir países:", err);
            cachedCountriesPromise = null;
            throw err;
        });
    return cachedCountriesPromise;
}

async function getOneCountry(countryIso2) {
    if (!countryIso2) return null;
    if (cachedOneCountryPromises[countryIso2]) return cachedOneCountryPromises[countryIso2];

    cachedOneCountryPromises[countryIso2] = fetch(`${API_BASE}/countries/${countryIso2}`, requestOptions)
        .then(res => res.json())
        .catch(err => {
            delete cachedOneCountryPromises[countryIso2];
            throw err;
        });
    return cachedOneCountryPromises[countryIso2];
}

async function getStatesByCountry(countryIso2) {
    if (!countryIso2) return [];
    if (cachedStatesPromises[countryIso2]) return cachedStatesPromises[countryIso2];

    cachedStatesPromises[countryIso2] = fetch(`${API_BASE}/countries/${countryIso2}/states`, requestOptions)
        .then(res => res.json())
        .catch(err => {
            delete cachedStatesPromises[countryIso2];
            throw err;
        });
    return cachedStatesPromises[countryIso2];
}

async function getStateDetails(countryIso2, stateIso2) {
    if (!countryIso2 || !stateIso2) return null;
    const key = `${countryIso2}-${stateIso2}`;
    if (cachedStateDetailsPromises[key]) return cachedStateDetailsPromises[key];

    cachedStateDetailsPromises[key] = fetch(
        `${API_BASE}/countries/${countryIso2}/states/${stateIso2}`,
        requestOptions
    )
        .then(res => res.json())
        .catch(err => {
            delete cachedStateDetailsPromises[key];
            throw err;
        });
    return cachedStateDetailsPromises[key];
}

export {
    getCountries,
    getOneCountry,
    getStatesByCountry,
    getStateDetails,
};