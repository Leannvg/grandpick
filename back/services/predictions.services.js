import {ObjectId} from "mongodb"
import {connectDB} from "./db.services.js"

export async function findAllPredictions() {
    try {
        const db = await connectDB();

        const predictions = await db.collection("Predictions").find({}).toArray();

        if (predictions.length === 0) return [];

        const userIds = new Set();
        const raceIds = new Set();
        const driverIds = new Set();
        const circuitIds = new Set();
        const pointsSystemIds = new Set();

        predictions.forEach(pred => {
            userIds.add(pred.userId.toString());
            raceIds.add(pred.raceId.toString());

            pred.prediction.forEach(p => {
                if (p.driver) driverIds.add(p.driver.toString());
            });
        });

        const races = await db.collection("Races").find({ _id: { $in: Array.from(raceIds).map(id => new ObjectId(id)) } }).toArray();

        races.forEach(race => {
            if (race.results) {
                race.results.forEach(r => {
                    if (r.driver) driverIds.add(r.driver.toString());
                });
            }
            if (race.id_circuit) circuitIds.add(race.id_circuit.toString());
            if (race.points_system) pointsSystemIds.add(race.points_system.toString());
        });

        const [users, drivers, circuits, pointsSystems] = await Promise.all([
            db.collection("Users").find({ _id: { $in: Array.from(userIds).map(id => new ObjectId(id)) } }).toArray(),
            db.collection("Drivers").find({ _id: { $in: Array.from(driverIds).map(id => new ObjectId(id)) } }).toArray(),
            db.collection("Circuits").find({ _id: { $in: Array.from(circuitIds).map(id => new ObjectId(id)) } }).toArray(),
            db.collection("Points_System").find({ _id: { $in: Array.from(pointsSystemIds).map(id => new ObjectId(id)) } }).toArray()
        ]);
        const userMap = new Map(users.map(u => [u._id.toString(), u]));
        const driverMap = new Map(drivers.map(d => [d._id.toString(), d]));
        const circuitMap = new Map(circuits.map(c => [c._id.toString(), c]));
        const pointsMap = new Map(pointsSystems.map(p => [p._id.toString(), p]));
        const raceMap = new Map(races.map(r => {

            const enrichedRace = { ...r };
            enrichedRace.circuit = circuitMap.get(r.id_circuit?.toString()) || null;
            enrichedRace.points_system = pointsMap.get(r.points_system?.toString()) || null;

            enrichedRace.results = r.results?.map(res => ({
                position: res.position,
                driver: driverMap.get(res.driver?.toString()) || null
            })) || [];

            return [r._id.toString(), enrichedRace];
        }));

        return predictions.map(pred => {
            const enrichedPrediction = pred.prediction.map(p => ({
                position: p.position,
                driver: driverMap.get(p.driver?.toString()) || null
            }));

            return {
                _id: pred._id,
                race: raceMap.get(pred.raceId?.toString()) || null,
                user: userMap.get(pred.userId?.toString()) || null,
                date_prediction: pred.date_prediction,
                prediction: enrichedPrediction
            };
        });

    } catch (err) {
        console.error("Error al obtener todas las predicciones:", err);
        throw err;
    }
}







export async function findPredictionById(predictionId) {
    try {
        const db = await connectDB();

        const prediction = await db.collection("Predictions").findOne({ _id: new ObjectId(predictionId) });
        if (!prediction) return null;

        const [race, user] = await Promise.all([
            db.collection("Races").findOne({ _id: new ObjectId(prediction.raceId) }),
            db.collection("Users").findOne({ _id: new ObjectId(prediction.userId) })
        ]);

        if (!race) return null;

        const predDriverIds = prediction.prediction.map(p => p.driver?.toString()).filter(Boolean);
        const resultDriverIds = race.results?.map(r => r.driver?.toString()).filter(Boolean) || [];

        const circuitId = race.id_circuit?.toString();
        const pointsSystemId = race.points_system?.toString();

        const allDriverIds = [...new Set([...predDriverIds, ...resultDriverIds])].map(id => new ObjectId(id));
        const [drivers, circuit, pointsSystem] = await Promise.all([
            db.collection("Drivers").find({ _id: { $in: allDriverIds } }).toArray(),
            circuitId ? db.collection("Circuits").findOne({ _id: new ObjectId(circuitId) }) : null,
            pointsSystemId ? db.collection("Points_System").findOne({ _id: new ObjectId(pointsSystemId) }) : null
        ]);

        const enrichedPrediction = prediction.prediction.map(p => {
            const driver = drivers.find(d => d._id.toString() === p.driver.toString());
            return {
                position: p.position,
                driver: driver || null
            };
        });

        const enrichedResults = race.results?.map(r => {
            const driver = drivers.find(d => d._id.toString() === r.driver.toString());
            return {
                position: r.position,
                driver: driver || null
            };
        }) || [];

        const enrichedRace = {
            ...race,
            circuit: circuit || null,
            points_system: pointsSystem || null,
            results: enrichedResults
        };

        return {
            _id: prediction._id,
            race: enrichedRace,
            user,
            date_prediction: prediction.date_prediction,
            prediction: enrichedPrediction
        };
    } catch (err) {
        console.error("Error al buscar la predicción por ID:", err);
        throw err;
    }
}








export async function createPrediction(prediction) {
    try {
        const db = await connectDB();
        const result = await db.collection("Predictions").insertOne(prediction);
        return { message: "Predicción creada exitosamente", result };
    } catch (err) {
        console.error("Error al crear la predicción:", err);
        throw err;
    }
}


export async function updatePrediction(predictionId, newPrediction) {
    try {
        const db = await connectDB();

        const result = await db.collection("Predictions").updateOne(
            { _id: new ObjectId(predictionId) },
            { $set: { prediction: newPrediction } }
        );

        if (result.upsertedCount > 0) {
            return "Predicción creada exitosamente.";
        } else if (result.modifiedCount > 0) {
            return "Predicción actualizada exitosamente.";
        } else {
            return "No se realizaron cambios.";
        }
    } catch (err) {
        console.error("Error al actualizar la predicción:", err);
        throw err;
    }
}


export async function deletePrediction(userId, raceId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Predictions").deleteOne({
            userId: new ObjectId(userId),
            raceId: new ObjectId(raceId)
        });

        if (result.deletedCount > 0) {
            return "Predicción eliminada exitosamente.";
        } else {
            return "No se encontró ninguna predicción para eliminar.";
        }
    } catch (err) {
        console.error("Error al eliminar la predicción:", err);
        throw err;
    }
}


export async function findPredictionsByUserId(userId) {
    try {
        const db = await connectDB();
        const predictions = await db.collection("Predictions").find({ userId: new ObjectId(userId) }).toArray();
        return predictions;
    } catch (err) {
        console.error("Error al obtener predicciones por usuario:", err);
        throw err;
    }
}


export async function findPredictionsByRaceId(raceId) {
    try {
        const db = await connectDB();
        const predictions = await db.collection("Predictions").find({ raceId: new ObjectId(raceId) }).toArray();
        return predictions;
    } catch (err) {
        console.error("Error al obtener predicciones por carrera:", err);
        throw err;
    }
}

export async function findPredictionByUserAndRace(userId, raceId) {
    try {
        const db = await connectDB();
        const prediction = await db.collection("Predictions").findOne({
            userId: new ObjectId(userId),
            raceId: new ObjectId(raceId)
        });
        return prediction;
    } catch (err) {
        console.error("Error al obtener predicción por usuario y carrera:", err);
        throw err;
    }
}