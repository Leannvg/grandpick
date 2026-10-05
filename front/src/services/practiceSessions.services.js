import { apiFetch } from "./api";

async function findAll({ year, circuitId } = {}) {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (circuitId) params.set("circuitId", circuitId);
    return apiFetch(`/api/practice-sessions?${params.toString()}`);
}

async function replaceForCircuit(circuitId, year, sessions) {
    return apiFetch(`/api/dashboard/practice-sessions/${circuitId}/${year}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ sessions }),
    });
}

export default { findAll, replaceForCircuit };
