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
  }
  return db;
}
