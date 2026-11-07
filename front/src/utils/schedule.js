import { DateTime } from "luxon";

// Extraído de CalendarCard.jsx para que GpHeroBanner.jsx (hero de Home)
// arme los horarios del fin de semana con la misma lógica real, sin
// duplicarla. Mismo comportamiento, sin cambios de reglas de negocio.

export const DOW = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
// Duraciones genéricas por tipo de sesión (la base todavía no las guarda)
export const DURATION = { practice: "60 MIN.", qualyMain: "60 MIN.", qualySprint: "45 MIN.", sprint: "35 MIN.", race: "2 HS." };

export const STATUS = {
    finished: { label: "Finalizado", icon: "bi-check2" },
    current: { label: "En curso", icon: "bi-broadcast" },
    next: { label: "Próximo", icon: "bi-hourglass-split" },
    upcoming: { label: "Próximo", icon: "bi-hourglass-split" },
};

// En la base la clasificación se guarda como "qualifying" (y antes como "qualy")
function normalizeType(type) {
    if (type === "qualifying" || type === "qualy") return "qualy";
    return type;
}

// Arma los grupos del panel a partir de las sesiones de Races.
// En fin de semana sprint, la clasificación anterior al sprint es "Clasificación sprint".
// SQ (clasificación sprint) viene de Practice_Sessions. Si existe, reemplaza a la regla por fecha.
export function buildSchedule(sessions, practices = []) {
    const hasSprint = sessions.some((s) => normalizeType(s.points_system?.type) === "sprint");
    const sprintMillis = hasSprint
        ? DateTime.fromISO(sessions.find((s) => normalizeType(s.points_system?.type) === "sprint").date_race).toMillis()
        : null;
    const sqList = practices.filter((p) => p.name === "SQ");
    const hasSq = sqList.length > 0;

    // predictable: true solo para sesiones que viven en Races (tienen Predictions
    // asociadas por raceId). Prácticas y SQ (de Practice_Sessions) son informativas,
    // no se puede predecir ahí — ver "¿Qué se puede calcular?" en rules/logica.md.
    const items = sessions.flatMap((s) => {
        const type = normalizeType(s.points_system?.type);
        const millis = DateTime.fromISO(s.date_race).toMillis();
        const base = { id: s._id, iso: s.date_race, sessionType: s.points_system?.type, predictable: true };
        if (type === "sprint") return [{ ...base, group: "sprint", label: "Sprint", dur: DURATION.sprint, race: false }];
        if (type === "qualy" && hasSprint && millis < sprintMillis)
            return hasSq ? [] : [{ ...base, group: "sprint", label: "Clasificación sprint", dur: DURATION.qualySprint, race: false }];
        if (type === "qualy") return [{ ...base, group: "main", label: "Clasificación", dur: DURATION.qualyMain, race: false }];
        return [{ ...base, group: "main", label: "Carrera", dur: DURATION.race, race: true }];
    });

    const sqItems = sqList.map((p) => ({
        id: p._id,
        iso: p.date_utc,
        group: "sprint",
        label: "Clasificación sprint",
        dur: DURATION.qualySprint,
        race: false,
        predictable: false,
    }));

    const practiceItems = practices.filter((p) => p.name !== "SQ").map((p) => ({
        id: p._id,
        iso: p.date_utc,
        group: "practice",
        label: `Práctica ${p.name.replace("FP", "")}`,
        dur: DURATION.practice,
        race: false,
        predictable: false,
    }));

    const sprintItems = [...items.filter((i) => i.group === "sprint"), ...sqItems]
        .sort((a, b) => DateTime.fromISO(a.iso).toMillis() - DateTime.fromISO(b.iso).toMillis());

    const groups = [];
    if (practiceItems.length) groups.push({ key: "practice", title: "Prácticas", icon: "bi-stopwatch", items: practiceItems.sort((a, b) => a.label.localeCompare(b.label)) });
    if (sprintItems.length) groups.push({ key: "sprint", title: "Fin de semana sprint", icon: "bi-lightning-charge-fill", items: sprintItems });
    groups.push({ key: "main", title: "Clasificación y carrera", icon: "bi-flag-fill", items: items.filter((i) => i.group === "main") });
    return groups.filter((g) => g.items.length > 0);
}

export function formatSessionTime(iso, zone) {
    const dt = DateTime.fromISO(iso).setZone(zone);
    return {
        dow: DOW[dt.weekday % 7],
        day: String(dt.day).padStart(2, "0"),
        time: dt.toFormat("HH:mm"),
    };
}
