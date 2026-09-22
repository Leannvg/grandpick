// Script de diagnóstico de SOLO LECTURA: lista las carreras que ya tienen
// resultados cargados (fecha, GP, tipo de sesión), para poder investigar con
// qué escudería corrió cada piloto en cada ronda real y así completar
// `results[].team` (backfill de constructores).
//
// Uso:
//   cd back
//   node scripts/list-loaded-races.js
//
// No modifica nada en la base.

import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

try {
  await client.connect();
  const db = client.db("GrandPick");

  const races = await db.collection("Races").aggregate([
    { $match: { "results.0": { $exists: true } } },
    {
      $lookup: {
        from: "Circuits",
        localField: "id_circuit",
        foreignField: "_id",
        as: "circuit",
      },
    },
    { $unwind: { path: "$circuit", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "Points_System",
        localField: "points_system",
        foreignField: "_id",
        as: "ps",
      },
    },
    { $unwind: { path: "$ps", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "Drivers",
        localField: "results.driver",
        foreignField: "_id",
        as: "drivers",
      },
    },
    {
      $project: {
        date_gp_start: 1,
        state: 1,
        type: "$ps.type",
        gp_name: "$circuit.gp_name",
        resultsCount: { $size: "$results" },
        driverTrigrams: "$drivers.trigram",
      },
    },
    { $sort: { date_gp_start: 1 } },
  ]).toArray();

  races.forEach((r) => {
    const fecha = new Date(r.date_gp_start).toISOString().slice(0, 10);
    const pilotos = (r.driverTrigrams || []).join(",");
    console.log(
      `${fecha} | ${r.gp_name || "?"} | ${r.type || "?"} | resultados:${r.resultsCount} | ${r.state} | pilotos: ${pilotos}`
    );
  });
  console.log("\nTotal de carreras con resultados:", races.length);
} finally {
  await client.close();
}
