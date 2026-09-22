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


/**
 * Arma la tabla de puntos (clasificación) de constructores de una temporada.
 * Suma únicamente los resultados de sesiones que otorgan puntos al campeonato:
 * Carrera y Sprint (la Qualy no otorga puntos, igual que en la F1 real).
 *
 * A diferencia de `findDriversStandings` (que muestra el equipo ACTUAL de
 * cada piloto), acá se suma por `results[].team` — el equipo con el que ese
 * piloto corrió esa carrera puntual — porque un piloto puede haber cambiado
 * de escudería durante la temporada. Los resultados que todavía no tienen
 * `team` cargado (carreras viejas, previas a este campo) no se cuentan y se
 * informan aparte en `unresolvedResults`.
 *
 * @param {number|string} year - Año de la temporada. Por defecto el año actual.
 * @returns {Promise<{ standings: Array, unresolvedResults: number }>}
 */
export async function findConstructorsStandings(year) {
    try {
        const db = await connectDB();

        const season = Number(year) || new Date().getFullYear();
        const start = new Date(`${season}-01-01T00:00:00.000Z`);
        const end = new Date(`${season + 1}-01-01T00:00:00.000Z`);

        const SCORING_TYPES = ["race", "sprint"];

        const pointsSystems = await db.collection("Points_System").find().toArray();
        const pointsSystemsMap = {};
        pointsSystems.forEach((ps) => {
            pointsSystemsMap[ps._id.toString()] = ps;
        });

        const races = await db.collection("Races").find({
            date_gp_start: { $gte: start, $lt: end },
            "results.0": { $exists: true }
        }).toArray();

        const pointsByTeam = {};
        const pointsByDriver = {};
        let unresolvedResults = 0;

        for (const race of races) {
            const ps = pointsSystemsMap[race.points_system?.toString()];
            if (!ps || !Array.isArray(ps.points) || !SCORING_TYPES.includes(ps.type)) continue;

            for (const result of race.results) {
                if (!result?.driver) continue;
                const earned = ps.points[result.position - 1] || 0;
                if (!earned) continue;

                const driverId = result.driver.toString();
                pointsByDriver[driverId] = (pointsByDriver[driverId] || 0) + earned;

                if (!result.team) {
                    unresolvedResults += 1;
                    continue;
                }
                const teamId = result.team.toString();
                pointsByTeam[teamId] = (pointsByTeam[teamId] || 0) + earned;
            }
        }

        // Plantel actual por escudería (mismo criterio que la tabla de
        // escuderías del admin: `Drivers.team`, no el histórico por carrera),
        // con los puntos totales de la temporada de cada piloto.
        const drivers = await db.collection("Drivers").find({ active: { $ne: false } }).toArray();
        const driversByTeam = {};
        drivers.forEach((d) => {
            if (!d.team) return;
            const teamId = d.team.toString();
            if (!driversByTeam[teamId]) driversByTeam[teamId] = [];
            driversByTeam[teamId].push({
                _id: d._id,
                full_name: d.full_name,
                trigram: d.trigram,
                points: pointsByDriver[d._id.toString()] || 0
            });
        });

        const teams = await db.collection("Teams").find().toArray();

        // Se listan todas las escuderías, sumen o no puntos todavía.
        const standings = teams
            .map((t) => ({
                _id: t._id,
                name: t.name,
                full_team_name: t.full_team_name,
                color: t.color,
                logo: t.logo,
                isologo: t.isologo,
                points: pointsByTeam[t._id.toString()] || 0,
                drivers: (driversByTeam[t._id.toString()] || [])
                    .sort((a, b) => b.points - a.points)
            }))
            .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

        standings.forEach((t, index) => {
            t.position = index + 1;
        });

        return { standings, unresolvedResults };
    } catch (err) {
        console.error("Error al armar la clasificación de constructores:", err);
        throw err;
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