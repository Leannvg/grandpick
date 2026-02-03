import { MongoClient } from "mongodb";
import {connectDB} from "./db.services.js"

const db = await connectDB();
const tokens = db.collection('Tokens');

async function createToken(token) {
  await tokens.insertOne(token);
}

async function findByToken(token) {
  return await tokens.findOne({ token });
}

async function deleteByToken(token) {
  await tokens.deleteOne({ token });
}

export {
  createToken,
  findByToken,
  deleteByToken,
};