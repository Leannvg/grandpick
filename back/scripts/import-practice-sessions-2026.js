// Carga los horarios de prácticas y clasificación sprint 2026 desde data/practice-sessions-2026.json.
// Convierte cada hora local (zona del circuito) a UTC y valida la QUALY contra la base.
//
// Uso:
//   node scripts/import-practice-sessions-2026.js            (simulación, no escribe)
//   node scripts/import-practice-sessions-2026.js --apply    (guarda en Practice_Sessions)

import "dotenv/config";
import fs from "fs";
import { connectDB } from "../services/db.services.js";

const YEAR = 2026;
const APPLY = process.argv.includes("--apply");
const data = JSON.parse(fs.readFileSync(new URL("../data/practice-sessions-2026.json", import.meta.url), "utf8"));

// Offset (ms) de una zona horaria en un instante dado, usando Intl (sin dependencias)
function offsetMs(utcMs, tz) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, hourCycle: "h23",
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(utcMs));
    const get = (t) => Number(parts.find((p) => p.type === t).value);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    return asUtc - utcMs;
}

// Hora local de un circuito -> instante UTC
function localToUtcMs(date, time, tz) {
    const [y, mo, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    const naive = Date.UTC(y, mo - 1, d, h, mi);
    const first = naive - offsetMs(naive, tz);
    return naive - offsetMs(first, tz);
}

const db = await connectDB();
const pointsType = new Map((await db.collection("Points_System").find().toArray()).map((p) => [String(p._id), p.type]));
const circuits = await db.collection("Circuits").find().toArray();

let errors = 0;
const toSave = [];

for (const gp of data) {
    const circuit = circuits.find((c) => c.gp_name === gp.gp);
    if (!circuit) {
        console.log(`✗ no existe el circuito "${gp.gp}"`);
        errors++;
        continue;
    }

    const quali = gp.sessions.find((s) => s.name === "QUALY");
    const qualiMs = localToUtcMs(quali.date, quali.time, gp.tz);

    const races = await db.collection("Races").find({ id_circuit: circuit._id }).toArray();
    const dbQuali = races.find((r) => pointsType.get(String(r.points_system)) === "qualifying");
    if (!dbQuali) {
        console.log(`✗ ${gp.gp}: no hay clasificación en la base para validar`);
        errors++;
        continue;
    }
    const diffMin = Math.abs(qualiMs - new Date(dbQuali.date_race).getTime()) / 60000;
    if (diffMin > 1) {
        console.log(`✗ ${gp.gp}: clasificación calculada ${new Date(qualiMs).toISOString()} ≠ base ${new Date(dbQuali.date_race).toISOString()}`);
        errors++;
        continue;
    }

    const docs = gp.sessions
        .filter((s) => s.name !== "QUALY")
        .map((s) => ({ id_circuit: circuit._id, year: YEAR, name: s.name, date_utc: new Date(localToUtcMs(s.date, s.time, gp.tz)) }));
    if (circuit.timezone !== gp.tz) console.log(`⚠ ${gp.gp}: timezone del circuito en la base "${circuit.timezone}" ≠ "${gp.tz}" (no se modifica desde este script)`);
    toSave.push({ gp: gp.gp, circuitId: circuit._id, docs });

    const lines = gp.sessions.filter((s) => s.name !== "QUALY").map((s, i) => {
        const d = docs[i];
        return `   ${s.name.padEnd(4)} ${s.date} ${s.time} (${gp.tz}) → ${d.date_utc.toISOString()}`;
    });
    console.log(`✓ ${gp.gp}\n${lines.join("\n")}`);
}

console.log(`\n${toSave.length} GP listos, ${errors} con error.`);

if (errors > 0) {
    console.log("No se guarda nada: corregí los errores del JSON y volvé a correr.");
    process.exit(1);
}

if (!APPLY) {
    console.log("Simulación: no se escribió nada. Para guardar, correr con --apply.");
    process.exit(0);
}

for (const item of toSave) {
    await db.collection("Practice_Sessions").deleteMany({ id_circuit: item.circuitId, year: YEAR });
    if (item.docs.length) await db.collection("Practice_Sessions").insertMany(item.docs);
}
console.log(`Guardadas ${toSave.length} GP en Practice_Sessions.`);
process.exit(0);
