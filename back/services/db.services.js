import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("❌ MONGO_URI no está definida");
}

const client = new MongoClient(uri);

let db;

export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(); // usa la DB definida en la URI
    console.log("✅ Mongo conectado");

    // Índices usados en queries frecuentes por userId/raceId (ej. getUserWithStats,
    // updatePointsAfterRace). createIndex es idempotente, se ejecuta una vez por
    // arranque del proceso, no por request.
    await Promise.all([
      db.collection("Predictions").createIndex({ userId: 1 }),
      db.collection("Predictions").createIndex({ raceId: 1 }),
      db.collection("Users_Points").createIndex({ userId: 1 }),
      db.collection("Users_Points").createIndex({ raceId: 1 }),
    ]);
  }
  return db;
}
