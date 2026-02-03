import { MongoClient } from "mongodb";


const client = new MongoClient("mongodb://127.0.0.1:27017");

let db;

export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("F1PredictZone");
    console.log("✅ Mongo conectado");
  }
  return db;
}