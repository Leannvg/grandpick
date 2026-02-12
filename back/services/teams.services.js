import { ObjectId } from 'mongodb';
import {connectDB} from "./db.services.js"


export async function findAllTeams() {
  const db = await connectDB();
  
  return db.collection("Teams").aggregate([
    {
      $lookup: {
        from: "Drivers",
        let: { teamId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$team", "$$teamId"] } } },
        ],
        as: "drivers"
      }
    }
  ]).toArray();
}



export async function findTeamById(teamId) {
  const db = await connectDB();

  const result = await db.collection("Teams").aggregate([
    { $match: { _id: new ObjectId(teamId) } },
    {
      $lookup: {
        from: "Drivers",
        let: { teamId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$team", "$$teamId"] } } },
        ],
        as: "drivers"
      }
    }
  ]).toArray();

  return result[0];
}


export async function createTeam(team) {
  const db = await connectDB();
  const result = await db.collection("Teams").insertOne(team);
  return { message: "Equipo creado exitosamente", result };
}

export async function updateTeam(teamId, newData) {
  const db = await connectDB();

  const result = await db.collection("Teams").updateOne(
    { _id: new ObjectId(teamId) },
    { $set: newData }
  );

  if (result.modifiedCount > 0) {
    return "Equipo actualizado exitosamente.";
  } else {
    return "No se realizaron cambios.";
  }
}

export async function deleteTeam(teamId) {
  const db = await connectDB();

  const result = await db.collection("Teams").deleteOne({
    _id: new ObjectId(teamId)
  });

  if (result.deletedCount > 0) {
    return "Equipo eliminado exitosamente.";
  } else {
    return "No se encontró el equipo.";
  }
}


export async function findTeamWithDrivers(teamId) {
  const db = await connectDB();

  const result = await db.collection("Teams").aggregate([
    {
      $match: { _id: new ObjectId(teamId) }
    },
    {
      $lookup: {
        from: "Drivers",
        localField: "drivers",
        foreignField: "_id",
        as: "drivers_info"
      }
    }
  ]).toArray();

  return result[0];
}