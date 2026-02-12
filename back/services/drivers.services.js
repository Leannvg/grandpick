import {ObjectId} from "mongodb"
import {connectDB} from "./db.services.js"

export async function findAllDrivers() {
    try {
        const db = await connectDB();
        const drivers = await db.collection("Drivers").aggregate([
            {
                $lookup: {
                    from: "Teams",
                    localField: "team",
                    foreignField: "_id",
                    as: "team_info"
                }
            },
            {
                $unwind: {
                    path: "$team_info",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).toArray();

        return drivers;
    } catch (err) {
        console.error("Error al obtener todos los pilotos:", err);
        throw err;
    }
}


export async function findDriverById(driverId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Drivers").aggregate([
            { $match: { _id: new ObjectId(driverId) } },
            {
                $lookup: {
                    from: "Teams",
                    localField: "team",
                    foreignField: "_id",
                    as: "team_info"
                }
            },

            { $unwind: { path: "$team_info", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        if (result.length === 0) {
            throw new Error("No se encontró ningún piloto con el ID proporcionado.");
        }

        return result[0];
    } catch (err) {
        console.error("Error al buscar piloto:", err);
        throw err;
    }
}




export async function createDriver(driver) {
    try {
        const db = await connectDB();
        const result = await db.collection("Drivers").insertOne(driver);
        return { message: "Piloto creado exitosamente", result };
    } catch (err) {
        console.error("Error al crear piloto:", err);
        throw err;
    }
}


export async function updateDriver(driverId, newDriver) {
    try {
        const db = await connectDB();

        if (newDriver.hasOwnProperty("team")) {
            const teamVal = newDriver.team;

            if (teamVal === null || teamVal === undefined || teamVal === "") {
                newDriver.team = null;
            } else {
                if (typeof teamVal === "string") {
                    if (!ObjectId.isValid(teamVal)) {
                        throw new Error("El ID del equipo no es válido.");
                    }
                    newDriver.team = new ObjectId(teamVal);
                } else if (teamVal instanceof ObjectId) {
                    // ya es ObjectId
                } else {
                    // valor inesperado: borrar / setear a null o lanzar error
                    newDriver.team = null;
                }
            }
        }

        const result = await db.collection("Drivers").updateOne(
            { _id: new ObjectId(driverId) },
            { $set: newDriver }
        );

        if (result.modifiedCount > 0) {
            return "Piloto actualizado exitosamente.";
        } else {
            return "No se realizaron cambios.";
        }
    } catch (err) {
        console.error("Error al actualizar el piloto:", err);
        throw err;
    }
}



export async function deleteDriver(driverId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Drivers").deleteOne({
            _id: new ObjectId(driverId)
        });

        return result;
    } catch (err) {
        console.error("Error al eliminar el piloto:", err);
        throw err;
    }
}

export async function isDriverUsedInRaces(driverId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Races").aggregate([
            { $unwind: "$results" },
            { $match: { "results.driver": new ObjectId(driverId) } },
            { $limit: 1 }
        ]).toArray();

        return result.length > 0;
    } catch (err) {
        console.error("Error al verificar si el piloto está usado en carreras:", err);
        throw err;
    }
}

export async function setDriverEnabledStatus(driverId, isEnabled) {
    try {
        const db = await connectDB();
        const result = await db.collection("Drivers").updateOne(
            { _id: new ObjectId(driverId) },
            { $set: { active: isEnabled } }
        );
        return result; 
    } catch (err) {
        console.error("Error al actualizar el estado del piloto:", err);
        throw err;
    }
}