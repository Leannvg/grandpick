const API_BASE = "https://api.countrystatecity.in/v1";

const headers = new Headers({
    "X-CSCAPI-KEY": import.meta.env.VITE_CSC_API_KEY
});

const requestOptions = {
    method: "GET",
    headers,
};

async function getCountries() {
    const res = await fetch(`${API_BASE}/countries`, requestOptions);
    return res.json();
}

async function getOneCountry(countryIso2) {
    const res = await fetch(`${API_BASE}/countries/${countryIso2}`, requestOptions);
    return res.json();
}

async function getStatesByCountry(countryIso2) {
    const res = await fetch(`${API_BASE}/countries/${countryIso2}/states`, requestOptions);
    return res.json();
}

async function getStateDetails(countryIso2, stateIso2) {
    const res = await fetch(
        `${API_BASE}/countries/${countryIso2}/states/${stateIso2}`,
        requestOptions
    );
    return res.json();
}

export {
    getCountries,
    getOneCountry,
    getStatesByCountry,
    getStateDetails,
};
