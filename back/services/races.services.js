import {MongoClient, ObjectId} from "mongodb"
import {connectDB} from "./db.services.js"


export async function findAllRaces() {
    try {
        const db = await connectDB();
        const races = await db.collection("Races").aggregate([
            {
                $lookup: {
                    from: "Drivers",
                    localField: "results.driver",
                    foreignField: "_id",
                    as: "drivers"
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
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: { path: "$circuit", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$points_system", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    results: {
                        $map: {
                            input: "$results",
                            as: "res",
                            in: {
                                position: "$$res.position",
                                driver: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$drivers",
                                                as: "d",
                                                cond: { $eq: ["$$d._id", "$$res.driver"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $project: { drivers: 0 } }
        ]).toArray();

        return races;
    } catch (err) {
        console.error("Error al obtener todas las carreras:", err);
        throw err;
    }
}


export async function findAllRacesByYear(year) {
    try {
        const db = await connectDB();
        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);

        const races = await db.collection("Races").aggregate([
            {
                $match: {
                    date_gp_start: { $gte: start, $lt: end }
                }
            },
            {
                $lookup: {
                    from: "Drivers",
                    localField: "results.driver",
                    foreignField: "_id",
                    as: "drivers"
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
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: { path: "$circuit", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$points_system", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    results: {
                        $map: {
                            input: "$results",
                            as: "res",
                            in: {
                                position: "$$res.position",
                                driver: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$drivers",
                                                as: "d",
                                                cond: { $eq: ["$$d._id", "$$res.driver"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $project: { drivers: 0 } }
        ]).toArray();

        return races;
    } catch (err) {
        console.error(`Error al obtener carreras del año ${year}:`, err);
        throw err;
    }
}




export async function findNextRace() {
    try {
        const db = await connectDB();

        const nextRace = await db.collection("Races").aggregate([
            {
                $match: {
                    date_race: { $gte: new Date() } // solo carreras futuras
                }
            },
            { $sort: { date_race: 1 } }, // ordena por la más próxima
            { $limit: 1 }, // solo la primera
            {
                $lookup: {
                    from: "Circuits",
                    localField: "id_circuit",
                    foreignField: "_id",
                    as: "circuit"
                }
            },
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: { path: "$circuit", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$points_system", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        return nextRace[0] || null;
    } catch (err) {
        console.error("Error al obtener la próxima carrera:", err);
        throw err;
    }
}



export async function findCurrentOrNextRace() {
    try {
        const db = await connectDB();

        const now = new Date();
        const duration = 1 * 60 * 1000;

        const races = await db.collection("Races").aggregate([
            {
                $addFields: {
                    start: "$date_race",
                    end: {
                        $add: ["$date_race", duration]
                    },
                    totalDuration: duration
                }
            },
            {
                $match: {
                    $or: [
                        // 1) Carrera en curso (start <= now <= end)
                        { start: { $lte: now }, end: { $gte: now } },

                        // 2) Próxima futura
                        { start: { $gt: now } }
                    ]
                }
            },
            { $sort: { start: 1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: "Circuits",
                    localField: "id_circuit",
                    foreignField: "_id",
                    as: "circuit"
                }
            },
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: "$circuit" },
            { $unwind: "$points_system" }
        ]).toArray();

        return races[0] || null;
    } catch (err) {
        console.error("Error en findCurrentOrNextRace:", err);
        throw err;
    }
}





export async function findRaceById(raceId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Races").aggregate([
            { $match: { _id: new ObjectId(raceId) } },
            {
                $lookup: {
                    from: "Drivers",
                    localField: "results.driver",
                    foreignField: "_id",
                    as: "drivers"
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
            {
                $lookup: {
                    from: "Points_System",
                    localField: "points_system",
                    foreignField: "_id",
                    as: "points_system"
                }
            },
            { $unwind: { path: "$circuit", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$points_system", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    results: {
                        $map: {
                            input: "$results",
                            as: "res",
                            in: {
                                position: "$$res.position",
                                driver: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$drivers",
                                                as: "d",
                                                cond: { $eq: ["$$d._id", "$$res.driver"] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $project: { drivers: 0 } }
        ]).toArray();

        if (result.length === 0) {
            throw new Error("No se encontró ninguna carrera con el ID proporcionado.");
        }

        return result[0];
    } catch (err) {
        console.error("Error al buscar la carrera:", err);
        throw err;
    }
}



export async function createRace(race) {
    try {
        const db = await connectDB();
        const result = await db.collection("Races").insertOne(race);
        return { message: "Carrera creada exitosamente", result };
    } catch (err) {
        console.error("Error al crear la carrera:", err);
        throw err;
    }
}


export async function updateRaceById(raceId, updates) {
    try {
        const db = await connectDB();
        const result = await db.collection("Races").updateOne(
            { _id: new ObjectId(raceId) },
            { $set: updates }
        );

        return result;
    } catch (err) {
        console.error("Error al actualizar la carrera:", err);
        throw err;
    }
}


export async function findByCircuitAndYear(circuitId, year) {
    try {
        const db = await connectDB();
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

        const result = await db.collection("Races").aggregate([
            {
                $match: {
                    id_circuit: new ObjectId(circuitId),
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
                $group: {
                    _id: {
                        id_circuit: "$id_circuit",
                        date_gp_start: "$date_gp_start",
                        date_gp_end: "$date_gp_end",
                        circuit: "$circuit"
                    },
                    race_types: {
                        $push: {
                            _id: "$_id",
                            points_system: "$points_system",
                            date_race: "$date_race",
                            state: "$state",
                            results: "$results"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    id_circuit: "$_id.id_circuit",
                    date_gp_start: "$_id.date_gp_start",
                    date_gp_end: "$_id.date_gp_end",
                    circuit: "$_id.circuit",
                    race_types: 1
                }
            },
            { $sort: { "race_types.date_race": 1 } }
        ]).toArray();

        return result[0] || null;
    } catch (err) {
        console.error("Error en findByCircuitAndYear:", err);
        throw err;
    }
}


export async function deleteRaceById(raceId) {
    try {
        const db = await connectDB();
        const result = await db.collection("Races").deleteOne(
            { _id: new ObjectId(raceId) }
        );
        return result;
    } catch (error) {
        console.error("Error al eliminar la carrera:", error);
        throw error;
    }
}