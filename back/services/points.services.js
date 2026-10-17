import { ObjectId } from "mongodb"
import { connectDB } from "./db.services.js"
import { getAllUsersWithStats } from "./users.services.js"

// Mismo desempate que usa el ranking global hoy en el frontend (front/src/pages/Ranking.jsx):
// puntos -> aciertos -> promedio por predicción -> countback de mejores GP.
function compareForRanking(a, b) {
    const pointsA = a.stats?.points?.total || 0;
    const pointsB = b.stats?.points?.total || 0;
    if (pointsB !== pointsA) return pointsB - pointsA;

    const successesA = a.stats?.successes?.total || 0;
    const successesB = b.stats?.successes?.total || 0;
    if (successesB !== successesA) return successesB - successesA;

    const avgA = a.stats?.predictions?.total > 0 ? pointsA / a.stats.predictions.total : 0;
    const avgB = b.stats?.predictions?.total > 0 ? pointsB / b.stats.predictions.total : 0;
    if (avgB !== avgA) return avgB - avgA;

    const scoresA = a.stats?.bestScores || [];
    const scoresB = b.stats?.bestScores || [];
    const maxLength = Math.max(scoresA.length, scoresB.length);
    for (let i = 0; i < maxLength; i++) {
        const scoreA = scoresA[i] || 0;
        const scoreB = scoresB[i] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
    }
    return 0;
}

// Ranking GLOBAL (toda la temporada, entre todos los usuarios). Se recalcula entero cada vez que se
// cargan resultados de una sesión, porque el desempate depende de los datos de todos los usuarios, no
// solo de los que jugaron esa sesión. Al ser disparado por una acción de admin (poco frecuente) en vez
// de en cada visita a un perfil, el costo de recorrer a todos los usuarios no afecta a los jugadores.
export async function updateGlobalRanking() {
    const db = await connectDB();
    const allUsers = await getAllUsersWithStats();
    const sorted = [...allUsers].sort(compareForRanking);

    const ops = sorted.map((u, i) => ({
        updateOne: {
            filter: { _id: u._id },
            update: { $set: { ranking_position: i + 1, ranking_total: sorted.length } }
        }
    }));
    if (ops.length > 0) await db.collection("Users").bulkWrite(ops);
}

// Ranking de UNA sesión puntual (ej. "tu posición en la clasificación de Austria"). Se guarda en el
// propio documento de Users_Points de esa sesión para que la ficha de piloto lo lea gratis, sin
// recalcular nada en cada visita. Desempate: puntos de esa sesión -> fecha de pronóstico más temprana
// (mismo criterio que ya usa getGrandPrixRanking en predictions.services.js).
export async function updateSessionRanking(raceId) {
    const db = await connectDB();
    const raceObjectId = new ObjectId(raceId);

    const [pointsEntries, predicciones] = await Promise.all([
        db.collection("Users_Points").find({ raceId: raceObjectId }).toArray(),
        db.collection("Predictions").find({ raceId: raceObjectId }).toArray()
    ]);
    if (pointsEntries.length === 0) return;

    const predictionDateByUser = new Map(predicciones.map(p => [p.userId.toString(), p.date_prediction]));

    const sorted = [...pointsEntries].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const dateA = new Date(predictionDateByUser.get(a.userId.toString()) || 0);
        const dateB = new Date(predictionDateByUser.get(b.userId.toString()) || 0);
        return dateA - dateB;
    });

    const ops = sorted.map((entry, i) => ({
        updateOne: {
            filter: { _id: entry._id },
            update: { $set: { rank: i + 1, totalPlayers: sorted.length } }
        }
    }));
    if (ops.length > 0) await db.collection("Users_Points").bulkWrite(ops);
}

export async function findAllPoints() {
    try {
        const db = await connectDB();
        const points = await db.collection("Points_System").find().toArray();
        return points;
    } catch (err) {
        console.error("Error al obtener todos los tipos de puntaje.", err);
        throw err;
    }
}

export async function updatePointsAfterRace(raceId) {
    try {
        const db = await connectDB();


        const race = await db.collection("Races").findOne({ _id: new ObjectId(raceId) });
        console.log(race)
        if (!race || !race.results || race.results.length === 0) {
            throw new Error(`No se encontraron resultados para la carrera con ID: ${raceId}`);
        }

        const pointsSystemDoc = await db.collection("Points_System").findOne({ _id: new ObjectId(race.points_system) });
        console.log(pointsSystemDoc)
        if (!pointsSystemDoc || !pointsSystemDoc.points) {
            throw new Error(`No se encontró el sistema de puntos con ID: ${race.points_system}`);
        }

        const sistemaPuntos = pointsSystemDoc.points;

        const predicciones = await db.collection("Predictions").find({ raceId: new ObjectId(raceId) }).toArray();
        if (!predicciones || predicciones.length === 0) {
            console.log(`No hay predicciones para la carrera con ID: ${raceId}`);
            return;
        }

        for (const prediccion of predicciones) {
            let puntos = 0;
            let pointsArray = sistemaPuntos;
            // BUG conocido: race.type no existe en los documentos de Races (la sesión se identifica por
            // points_system, ver rules/logica.md), así que esta condición nunca es verdadera y el
            // descuento de 1/3 en qualy nunca se aplica. No se corrige acá: cambiar puntos ya
            // otorgados es una decisión aparte (ver rules/registro-de-cambios.md).
            if (race.type?.toLowerCase().includes('qual') && new Date(race.date_race) < new Date('2026-05-21T00:00:00-03:00')) {
                pointsArray = sistemaPuntos.map(p => p / 3);
            }
            for (let i = 0; i < race.results.length; i++) {
                const resultDriverId = race.results[i].driver.toString();
                const predictedDriverId = prediccion.prediction[i]?.driver?.toString();
                if (resultDriverId === predictedDriverId) {
                    puntos += pointsArray[i] || 0;
                }
            }

            const previousPoints = prediccion.previous_points || 0;
            const difference = puntos - previousPoints;

            await db.collection("Users_Points").updateOne(
                { userId: prediccion.userId, raceId: new ObjectId(raceId) },
                { $set: { points: puntos } },
                { upsert: true }
            );

            await db.collection("Users").updateOne(
                { _id: prediccion.userId },
                { $inc: { points: difference } }
            );

            await db.collection("Predictions").updateOne(
                { _id: prediccion._id },
                { $set: { previous_points: puntos } }
            );
        }

        await updateSessionRanking(raceId);
        await updateGlobalRanking();

        console.log("✅ Puntos actualizados correctamente para la carrera:", raceId);
    } catch (err) {
        console.error("❌ Error al actualizar puntos después de la carrera:", err.message);
    }
}


