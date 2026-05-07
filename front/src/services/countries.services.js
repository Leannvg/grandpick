const API_BASE = "https://api.countrystatecity.in/v1";

const headers = new Headers({
    "X-CSCAPI-KEY": import.meta.env.VITE_API_COUNTRIES
});

const requestOptions = {
    method: "GET",
    headers,
};

// --- Cache Variables ---
let cachedCountriesPromise = null;
const cachedOneCountryPromises = {};
const cachedStatesPromises = {};
const cachedStateDetailsPromises = {};

// --- Caching Constants ---
const COUNTRIES_CACHE_KEY = "gp_countries_list";

async function getCountries() {
    // 1. Verificar Memoria RAM (lo más rápido)
    if (cachedCountriesPromise) {
        console.log("💎 [RAM] Cargando países desde memoria de la sesión");
        return cachedCountriesPromise;
    }

    // 2. Verificar LocalStorage (sobrevive a F5)
    const storedCountries = localStorage.getItem(COUNTRIES_CACHE_KEY);

    if (storedCountries) {
        console.log("💾 [Disk] Cargando países desde LocalStorage (Persistente)");
        const data = JSON.parse(storedCountries);
        cachedCountriesPromise = Promise.resolve(data);
        return cachedCountriesPromise;
    }

    // 3. Si no hay nada, pedir a la API
    console.log("🌐 [API] Pidiendo lista de países a la API externa...");
    cachedCountriesPromise = fetch(`${API_BASE}/countries`, requestOptions)
        .then(res => res.json())
        .then(data => {
            // Guardar en LocalStorage para siempre
            localStorage.setItem(COUNTRIES_CACHE_KEY, JSON.stringify(data));
            return data;
        })
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