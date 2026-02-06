import {ObjectId} from "mongodb"
import {connectDB} from "./db.services.js"

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

            for (let i = 0; i < race.results.length; i++) {
                const resultDriverId = race.results[i].driver.toString();
                const predictedDriverId = prediccion.prediction[i]?.driver?.toString();

                if (resultDriverId === predictedDriverId) {
                    puntos += sistemaPuntos[i] || 0;
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

        console.log("✅ Puntos actualizados correctamente para la carrera:", raceId);
    } catch (err) {
        console.error("❌ Error al actualizar puntos después de la carrera:", err.message);
    }
}


