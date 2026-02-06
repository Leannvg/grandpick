import {ObjectId} from "mongodb"
import {connectDB} from "./db.services.js"

export async function findAllCircuits() {
    try {
        const db = await connectDB();
        const circuits = await db.collection("Circuits").find().toArray();
        return circuits;
    } catch (err) {
        console.error("Error al obtener todos los circuitos:", err);
        throw err;
    }
}

export async function findCircuitById(circuitId) {
    try {
        const db = await connectDB();

        const driver = await db.collection("Circuits").findOne({
            _id: new ObjectId(circuitId)
        });

        if (!driver) {
            throw new Error("No se encontró ningún circuito con el ID proporcionado.");
        }

        return driver;

    } catch (err) {
        console.error("Error al buscar circuito:", err);
        throw err;
    }
}



export async function createCircuit(circuit) {
    try {
        const db = await connectDB();
        const result = await db.collection("Circuits").insertOne(circuit);
        return { message: "circuito creado exitosamente", result };
    } catch (err) {
        console.error("Error al crear circuito:", err);
        throw err;
    }
}


export async function updateCircuit(circuitId, newCircuit) {
    try {
        const db = await connectDB();

        const result = await db.collection("Circuits").updateOne(
            { _id: new ObjectId(circuitId)},
            { $set: newCircuit },
        );

        if (result.upsertedCount > 0) {
            return "Circuito creada exitosamente.";
        } else if (result.modifiedCount > 0) {
            return "Circuito actualizada exitosamente.";
        } else {
            return "No se realizaron cambios.";
        }
    } catch (err) {
        console.error("Error al actualizar el circuito:", err);
        throw err;
    } 
}


export async function deleteCircuit(circuitId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Circuits").deleteOne({
            _id: new ObjectId(circuitId)
        });

        return result;
    } catch (err) {
        console.error("Error al eliminar circuito:", err);
        throw err;
    }
}
