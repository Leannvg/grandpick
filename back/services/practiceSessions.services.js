import { ObjectId } from "mongodb";
import { connectDB } from "./db.services.js";

export async function findPracticeSessions({ year, circuitId }) {
    const db = await connectDB();
    const filter = {};
    if (year) filter.year = Number(year);
    if (circuitId) filter.id_circuit = new ObjectId(circuitId);
    return db.collection("Practice_Sessions").find(filter).sort({ date_utc: 1 }).toArray();
}

export async function replacePracticeSessions(circuitId, year, sessions) {
    const db = await connectDB();
    const id_circuit = new ObjectId(circuitId);
    const yearNum = Number(year);
    await db.collection("Practice_Sessions").deleteMany({ id_circuit, year: yearNum });
    if (sessions.length === 0) return [];
    const docs = sessions.map((s) => ({
        id_circuit,
        year: yearNum,
        name: s.name,
        date_utc: new Date(s.date_utc),
    }));
    await db.collection("Practice_Sessions").insertMany(docs);
    return docs;
}
