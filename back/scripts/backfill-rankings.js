// Carga inicial del ranking por sesión y del ranking global, para las sesiones que ya tienen
// resultados cargados (de acá en adelante esto lo hace updatePointsAfterRace en cada carga nueva,
// ver services/points.services.js). Sin esto, "Posición final" y "Mejor posición" de la ficha de
// piloto mostrarían "sin datos" para todo lo ya jugado.
//
// Uso:
//   node scripts/backfill-rankings.js            (simulación: solo cuenta, no escribe)
//   node scripts/backfill-rankings.js --apply     (calcula y guarda)

import "dotenv/config";
import { connectDB } from "../services/db.services.js";
import { updateSessionRanking, updateGlobalRanking } from "../services/points.services.js";

const APPLY = process.argv.includes("--apply");

const db = await connectDB();
const closedRaces = await db.collection("Races").find({ "results.0": { $exists: true } }).toArray();
const users = await db.collection("Users").countDocuments();

console.log(`Sesiones con resultados: ${closedRaces.length}`);
console.log(`Usuarios: ${users}`);

if (!APPLY) {
    console.log("Simulación: no se escribió nada. Para calcular y guardar, correr con --apply.");
    process.exit(0);
}

let done = 0;
for (const race of closedRaces) {
    await updateSessionRanking(race._id.toString());
    done++;
    if (done % 10 === 0) console.log(`  ${done}/${closedRaces.length} sesiones...`);
}
console.log(`✓ Ranking por sesión calculado para ${done} sesiones.`);

await updateGlobalRanking();
console.log("✓ Ranking global recalculado.");
process.exit(0);
