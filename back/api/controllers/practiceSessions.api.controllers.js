import * as practiceSessionsServices from "../../services/practiceSessions.services.js";

const ALLOWED_NAMES = ["FP1", "FP2", "FP3"];

export async function findAll(req, res) {
    const { year, circuitId } = req.query;
    const sessions = await practiceSessionsServices.findPracticeSessions({ year, circuitId });
    res.status(200).json(sessions);
}

export async function replaceForCircuit(req, res) {
    const { circuitId, year } = req.params;
    const sessions = Array.isArray(req.body?.sessions) ? req.body.sessions : null;

    if (!sessions) return res.status(400).json({ message: "Se esperaba un arreglo 'sessions'." });

    const valid = sessions.every(
        (s) => ALLOWED_NAMES.includes(s.name) && !Number.isNaN(new Date(s.date_utc).getTime())
    );
    if (!valid) return res.status(400).json({ message: "Cada práctica necesita un nombre (FP1-FP3) y una fecha válida en UTC." });

    const saved = await practiceSessionsServices.replacePracticeSessions(circuitId, year, sessions);
    res.status(200).json(saved);
}
