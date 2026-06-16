import { ObjectId } from "mongodb"
import { connectDB } from "./db.services.js"

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

export async function getUserPredictionHistory(userId, year) {
    try {
        const db = await connectDB();
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

        // 1. Get all Races for the year
        const races = await db.collection("Races").aggregate([
            {
                $match: {
                    date_gp_start: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $lookup: {
                    from: "Circuits",
                    localField: "id_circuit",
                    foreignField: "_id",
                    as: "circuit"
                }
            },
            { $unwind: "$circuit" },
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: "$points_system" },
            {
                $lookup: {
                    from: "Predictions",
                    let: { raceId: "$_id", userId: new ObjectId(userId) },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$raceId", "$$raceId"] }, { $eq: ["$userId", "$$userId"] }] } } }
                    ],
                    as: "userPrediction"
                }
            },
            { $unwind: { path: "$userPrediction", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "Users_Points",
                    let: { raceId: "$_id", userId: new ObjectId(userId) },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$raceId", "$$raceId"] }, { $eq: ["$userId", "$$userId"] }] } } }
                    ],
                    as: "userPoints"
                }
            },
            { $unwind: { path: "$userPoints", preserveNullAndEmptyArrays: true } },
            {
                $sort: { date_race: 1 }
            }
        ]).toArray();

        // 2. Fetch all unique driver IDs from predictions and results to enrich them
        const driverIds = new Set();
        races.forEach(r => {
            if (r.results) r.results.forEach(res => driverIds.add(res.driver.toString()));
            if (r.userPrediction?.prediction) r.userPrediction.prediction.forEach(p => driverIds.add(p.driver.toString()));
        });

        const drivers = await db.collection("Drivers").find({ _id: { $in: Array.from(driverIds).map(id => new ObjectId(id)) } }).toArray();
        const driverMap = new Map(drivers.map(d => [d._id.toString(), d]));

        // Lookup teams for drivers
        const teamIds = new Set(drivers.map(d => d.team?.toString()).filter(Boolean));
        const teams = await db.collection("Teams").find({ _id: { $in: Array.from(teamIds).map(id => new ObjectId(id)) } }).toArray();
        const teamMap = new Map(teams.map(t => [t._id.toString(), t]));

        // Enrich races
        const enrichedRaces = races.map(r => {
            const enrich = (list) => list?.map(item => ({
                ...item,
                driver: {
                    ...driverMap.get(item.driver.toString()),
                    team_info: teamMap.get(driverMap.get(item.driver.toString())?.team?.toString())
                }
            })) || [];

            return {
                ...r,
                results: enrich(r.results),
                userPrediction: r.userPrediction ? {
                    ...r.userPrediction,
                    prediction: enrich(r.userPrediction.prediction)
                } : null,
                pointsEarned: r.userPoints?.points || 0
            };
        });

        // 3. Group by Circuit
        const groupedByCircuit = enrichedRaces.reduce((acc, race) => {
            const circuitId = race.id_circuit.toString();
            if (!acc[circuitId]) {
                acc[circuitId] = {
                    circuit: race.circuit,
                    date_gp_start: race.date_gp_start,
                    date_gp_end: race.date_gp_end,
                    totalPoints: 0,
                    sessions: []
                };
            }
            acc[circuitId].sessions.push({
                _id: race._id,
                type: race.points_system.type,
                date_race: race.date_race,
                state: race.state,
                results: race.results,
                prediction: race.userPrediction?.prediction || null,
                points: race.pointsEarned,
                points_system: race.points_system
            });
            acc[circuitId].totalPoints += race.pointsEarned;
            return acc;
        }, {});

        return Object.values(groupedByCircuit).sort((a, b) => new Date(a.date_gp_start) - new Date(b.date_gp_start));

    } catch (err) {
        console.error("Error al obtener historial de predicciones:", err);
        throw err;
    }
}

function formatTimeGap(ms) {
    if (ms < 0) ms = 0;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    const milliseconds = ms % 1000;
    
    if (hours > 0) return `+${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `+${minutes}m ${seconds}s`;
    return `+${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
}

export async function getGrandPrixRanking(circuitId, year) {
    try {
        const db = await connectDB();
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

        const races = await db.collection("Races").find({
            id_circuit: new ObjectId(circuitId),
            date_gp_start: { $gte: startOfYear, $lte: endOfYear }
        }).toArray();

        if (races.length === 0) return [];

        const mainRace = races.find(r => r.type && r.type.toLowerCase() === 'race');
        const mainRaceId = mainRace ? mainRace._id.toString() : null;

        const raceIds = races.map(r => r._id);

        const predictions = await db.collection("Predictions").find({
            raceId: { $in: raceIds }
        }).toArray();

        // Group by user
        const userStats = {};
        for (const pred of predictions) {
            const uid = pred.userId.toString();
            if (!userStats[uid]) {
                userStats[uid] = {
                    userId: pred.userId,
                    totalPoints: 0,
                    earliestDate: pred.date_prediction,
                    mainRaceDate: null,
                    predictionsCount: 0
                };
            }
            userStats[uid].totalPoints += (pred.previous_points || 0);
            userStats[uid].predictionsCount += 1;
            
            if (mainRaceId && pred.raceId.toString() === mainRaceId) {
                userStats[uid].mainRaceDate = pred.date_prediction;
            } else if (new Date(pred.date_prediction) < new Date(userStats[uid].earliestDate)) {
                userStats[uid].earliestDate = pred.date_prediction;
            }
        }

        const userIds = Object.values(userStats).map(u => u.userId);
        const users = await db.collection("Users").find({ _id: { $in: userIds } }).toArray();
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        let ranking = Object.values(userStats).map(stat => {
            const user = userMap.get(stat.userId.toString());
            // Usamos mainRaceDate preferentemente
            const datePrediction = stat.mainRaceDate || stat.earliestDate;
            const hasMainRace = !!stat.mainRaceDate;
            
            return {
                _id: stat.userId.toString(),
                name: user?.name || "Desconocido",
                last_name: user?.last_name || "",
                country: user?.country || "AR",
                img_user: user?.img_user || "",
                points: stat.totalPoints,
                date_prediction: datePrediction,
                hasMainRace: hasMainRace,
                predictionsCount: stat.predictionsCount
            };
        });

        // Sort: Points DESC, Has Race Prediction, Date ASC
        ranking.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            
            if (a.hasMainRace !== b.hasMainRace) {
                return a.hasMainRace ? -1 : 1; // Priorizar al que tiene carrera
            }
            
            return new Date(a.date_prediction) - new Date(b.date_prediction);
        });

        // First pass: identify tie groups
        const pointsCounts = {};
        ranking.forEach(entry => {
            pointsCounts[entry.points] = (pointsCounts[entry.points] || 0) + 1;
        });

        // Calculate Rank and Gap
        let currentRank = 1;
        let currentTiedGroupLeaderDate = null;
        let currentTiedGroupPoints = -1;
        
        ranking.forEach((entry) => {
            entry.globalRank = currentRank;
            currentRank++;
            
            const isTiedWithSomeone = pointsCounts[entry.points] > 1;

            if (!isTiedWithSomeone) {
                entry.gap = "-";
            } else {
                if (entry.points !== currentTiedGroupPoints) {
                    // First person of this new tie group
                    currentTiedGroupPoints = entry.points;
                    currentTiedGroupLeaderDate = new Date(entry.date_prediction);
                    
                    // Format exact time in Argentina Timezone
                    const timeStr = currentTiedGroupLeaderDate.toLocaleString("es-AR", { 
                        timeZone: "America/Argentina/Buenos_Aires", 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                    });
                    entry.gap = `${timeStr} (RACE)`;
                } else {
                    // Subsequent person in the tie group
                    const timeDiff = new Date(entry.date_prediction) - currentTiedGroupLeaderDate;
                    entry.gap = formatTimeGap(timeDiff);
                }
            }
        });

        return ranking;

    } catch (err) {
        console.error("Error en getGrandPrixRanking:", err);
        throw err;
    }
}

export default {
    createPrediction,
    editPrediction: updatePrediction,
    findPredictionByUserAndRace,
    findPredictionsByUserId,
    findPredictionsByRaceId,
    findAllPredictions,
    findPredictionById,
    deletePrediction,
    getUserPredictionHistory,
    getGrandPrixRanking
}