import {MongoClient, ObjectId} from "mongodb"
import {connectDB} from "./db.services.js"


export async function findAllRacesResults(raceId) {
    try {
        const db = await connectDB();

        const results = await db.collection("Races_Results").aggregate([
            {
                $match: { raceId: new ObjectId(raceId) }
            },
            {
                $lookup: {
                    from: "Races",
                    localField: "raceId",
                    foreignField: "_id",
                    as: "race"
                }
            },
            {
                $unwind: {
                    path: "$race",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).toArray();

        return results;
    } catch (err) {
        console.error("Error al obtener resultados por raceId:", err);
        throw err;
    }
}



export async function findRaceResultById(resultId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Races_Results").aggregate([
            { $match: { _id: new ObjectId(resultId) } },
            { $unwind: "$results" },
            {
                $lookup: {
                    from: "Drivers",
                    localField: "results.driver",
                    foreignField: "_id",
                    as: "results.driver"
                }
            },
            { $unwind: "$results.driver" },
            {
                $group: {
                    _id: "$_id",
                    raceId: { $first: "$raceId" },
                    results: {
                        $push: {
                            position: "$results.position",
                            driver: "$results.driver"
                        }
                    }
                }
            }
        ]).toArray();

        if (!result.length) throw new Error("No se encontró el resultado de carrera.");

        return result[0];
    } catch (err) {
        console.error("Error al buscar el resultado de la carrera:", err);
        throw err;
    }
}


export async function createRaceResults(results) {
    const db = await connectDB();
    const result = await db.collection("Races_Results").insertOne(results);
    return { insertedId: result.insertedId };
}

export async function setRaceAsFinished(raceId, resultsId) {
  const db = await connectDB();
  return await db.collection("Races").updateOne(
    { _id: new ObjectId(raceId) },
    {
      $set: {
        resultados: resultsId,
        estado: "Finalizado"
      }
    }
  );
}

