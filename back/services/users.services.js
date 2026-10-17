import { ObjectId } from "mongodb"
import bcrypt from "bcrypt";
import crypto from "crypto";
import { connectDB } from "./db.services.js"


const db = await connectDB();
const users = db.collection('Users');
const predictions = db.collection("Predictions");
const usersPoints = db.collection("Users_Points");
const races = db.collection("Races");
const pointsSystem = db.collection("Points_System");
const drivers = db.collection("Drivers");
const teams = db.collection("Teams");

// Regla histórica: qualy antes del 21/05/2026 vale 1/3 de los puntos (igual que updatePointsAfterRace,
// pero ahí el chequeo usa race.type, que no existe en los documentos — ver rules/logica.md. Acá se usa
// el tipo real (points_system.type) para que "puntos perdidos" sea consistente con la regla documentada).
const QUALY_DISCOUNT_CUTOFF = new Date("2026-05-21T00:00:00-03:00");
function pointsArrayFor(ps, dateRace) {
  if (ps?.type === "qualifying" && new Date(dateRace) < QUALY_DISCOUNT_CUTOFF) {
    return ps.points.map(p => p / 3);
  }
  return ps?.points || [];
}


async function getUsers() {
  return users.find().toArray();
}

async function getUserById(id) {
  return users.findOne({ _id: new ObjectId(id) });
}

async function createUser(user) {
  const userExistente = await users.findOne({ email: user.email });

  if (userExistente) {
    throw new Error("El email utilizado para registrarse ya existe");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(user.password, salt);

  const newUser = {
    ...user,
    password: passwordHash,
  };

  await users.insertOne(newUser);
  return newUser;
}

async function login(userLogin) {
  const user = await users.findOne({ email: userLogin.email });

  if (!user) {
    throw new Error("El usuario no existe");
  }

  if (user.blocked) {
    throw new Error("Tu cuenta se encuentra bloqueada por razones de seguridad.");
  }

  const validPassword = await bcrypt.compare(userLogin.password, user.password);
  if (!validPassword) {
    throw new Error("Contraseña incorrecta");
  }

  return user;
}


async function editUser(id, user) {
  return users.updateOne({ _id: new ObjectId(id) }, { $set: user });
}

async function removeUser(id) {
  await users.deleteOne({ _id: new ObjectId(id) });
  return true;
}

async function getUserWithStats(userId, racesInfo = null, psystems = null, driversInfo = null, teamsInfo = null) {
  if (!ObjectId.isValid(userId)) {
    throw new Error("ID inválido");
  }

  if (!racesInfo) {
    racesInfo = await races.find({}).toArray();
  }
  if (!psystems) {
    psystems = await pointsSystem.find({}).toArray();
  }
  if (!driversInfo) {
    driversInfo = await drivers.find({}).toArray();
  }
  if (!teamsInfo) {
    teamsInfo = await teams.find({}).toArray();
  }

  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return null;

  const preds = await predictions.find({ userId: new ObjectId(userId) }).toArray();
  const pointsByRace = await usersPoints.find({ userId: new ObjectId(userId) }).toArray();
  const predictedRaceIds = new Set(preds.map(p => p.raceId.toString()));

  const stats = {
    predictions: { total: preds.length, qualifying: 0, sprint: 0, race: 0 },
    successes: { total: 0, qualifying: 0, sprint: 0, race: 0 },
    points: { total: 0, qualifying: 0, sprint: 0, race: 0 },
    bestScores: [],
    // Nuevos, para la ficha de piloto (ver rules/features/estadisticas-perfil.md)
    podiums: { total: 0, byCircuit: {} },
    poles: { total: 0, byCircuit: {} },
    hitsByCircuit: {},
    bestSession: null,
    failStreak: 0,
    mostPredictedDriver: null,
    mostAccurateTeam: null,
    pointsLost: { total: 0, byMistakes: 0, byMissedSessions: 0 },
    ranking: { position: user.ranking_position ?? null, total: user.ranking_total ?? null, bestPosition: null },
    sessionRanking: []
  };

  const driverCount = {};
  const teamCount = {};
  // Orden cronológico (por fecha de carrera) de las sesiones cerradas, para la racha de fallos
  const closedChrono = [];

  for (const p of preds) {
    const race = racesInfo.find(r => r._id.toString() === p.raceId.toString());
    if (!race) continue;

    const ps = psystems.find(ps => ps._id.equals(race.points_system));
    const type = ps ? ps.type : "race";
    const circuitId = race.id_circuit?.toString();

    stats.predictions[type] = (stats.predictions[type] || 0) + 1;

    for (const pred of p.prediction) {
      if (pred.driver) driverCount[pred.driver.toString()] = (driverCount[pred.driver.toString()] || 0) + 1;
    }

    const isClosed = race.results && race.results.length > 0;
    if (isClosed) {
      let successes = 0;
      const pointsArray = pointsArrayFor(ps, race.date_race);
      for (const pred of p.prediction) {
        const result = race.results.find(r => r.position === pred.position);
        const hit = result && pred.driver && result.driver.toString() === pred.driver.toString();
        if (hit) {
          successes++;
          if (circuitId && (type === "race" || type === "sprint") && pred.position <= 3) {
            stats.podiums.total++;
            stats.podiums.byCircuit[circuitId] = (stats.podiums.byCircuit[circuitId] || 0) + 1;
          }
          if (circuitId && type === "qualifying" && pred.position === 1) {
            stats.poles.total++;
            stats.poles.byCircuit[circuitId] = (stats.poles.byCircuit[circuitId] || 0) + 1;
          }
          const team = result.team?.toString();
          if (team) teamCount[team] = (teamCount[team] || 0) + 1;
        } else {
          stats.pointsLost.byMistakes += pointsArray[pred.position - 1] || 0;
        }
      }
      stats.successes.total += successes;
      stats.successes[type] = (stats.successes[type] || 0) + successes;
      if (circuitId) stats.hitsByCircuit[circuitId] = (stats.hitsByCircuit[circuitId] || 0) + successes;

      if (!stats.bestSession || successes > stats.bestSession.successes) {
        stats.bestSession = { successes, raceId: race._id.toString(), circuitId, type };
      }
      closedChrono.push({ date: new Date(race.date_race), successes });
    }
  }

  // Piloto más predicho
  const topDriverId = Object.keys(driverCount).sort((a, b) => driverCount[b] - driverCount[a])[0];
  if (topDriverId) {
    const driver = driversInfo.find(d => d._id.toString() === topDriverId);
    stats.mostPredictedDriver = { driverId: topDriverId, trigram: driver?.trigram || "???", count: driverCount[topDriverId] };
  }

  // Equipo más acertado (con el equipo con el que corrió el piloto esa carrera puntual, results[].team;
  // carreras cargadas antes de que ese campo existiera no suman acá — ver rules/logica.md)
  const topTeamId = Object.keys(teamCount).sort((a, b) => teamCount[b] - teamCount[a])[0];
  if (topTeamId) {
    const team = teamsInfo.find(t => t._id.toString() === topTeamId);
    stats.mostAccurateTeam = { teamId: topTeamId, name: team?.name || "???", count: teamCount[topTeamId] };
  }

  // Racha de fallos: sesiones cerradas seguidas sin acierto, contando desde la más reciente
  closedChrono.sort((a, b) => b.date - a.date);
  for (const s of closedChrono) {
    if (s.successes === 0) stats.failStreak++;
    else break;
  }

  // Puntos perdidos por no predecir una sesión cerrada
  for (const race of racesInfo) {
    if (!(race.results && race.results.length > 0)) continue;
    if (predictedRaceIds.has(race._id.toString())) continue;
    const ps = psystems.find(ps => ps._id.equals(race.points_system));
    const pointsArray = pointsArrayFor(ps, race.date_race);
    stats.pointsLost.byMissedSessions += pointsArray.reduce((a, b) => a + b, 0);
  }
  stats.pointsLost.total = stats.pointsLost.byMistakes + stats.pointsLost.byMissedSessions;

  const gpPointsMap = {};

  for (const pb of pointsByRace) {
    const race = racesInfo.find(r => r._id.toString() === pb.raceId.toString());
    if (!race) continue;

    const ps = psystems.find(ps => ps._id.equals(race.points_system));
    const type = ps ? ps.type : "race";

    stats.points.total += pb.points;
    stats.points[type] = (stats.points[type] || 0) + pb.points;

    if (race.id_circuit) {
      const circuitIdStr = race.id_circuit.toString();
      gpPointsMap[circuitIdStr] = (gpPointsMap[circuitIdStr] || 0) + pb.points;
    }

    // Posición en el ranking de esa sesión puntual (escrita por updatePointsAfterRace, ver points.services.js)
    if (pb.rank != null) {
      const entry = { raceId: race._id.toString(), circuitId: race.id_circuit?.toString() || null, type, rank: pb.rank, total: pb.totalPlayers || null };
      stats.sessionRanking.push(entry);
      if (!stats.ranking.bestPosition || entry.rank < stats.ranking.bestPosition.rank) {
        stats.ranking.bestPosition = entry;
      }
    }
  }

  stats.bestScores = Object.values(gpPointsMap).sort((a, b) => b - a);
  stats.pointsByCircuit = gpPointsMap;

  return { ...user, stats };
}

async function getAllUsersWithStats() {
  const allUsers = await users.find().toArray();
  const racesInfo = await races.find({}).toArray();
  const psystems = await pointsSystem.find({}).toArray();
  const driversInfo = await drivers.find({}).toArray();
  const teamsInfo = await teams.find({}).toArray();

  const results = [];
  for (const u of allUsers) {
    const enriched = await getUserWithStats(u._id, racesInfo, psystems, driversInfo, teamsInfo);
    results.push(enriched);
  }
  return results;
}

async function blockUser(id) {
  const result = await users.updateOne(
    { _id: new ObjectId(id) },
    { $set: { blocked: true } }
  );
  return result.modifiedCount > 0;
}

async function unblockUser(id) {
  const result = await users.updateOne(
    { _id: new ObjectId(id) },
    { $set: { blocked: false } }
  );
  return result.modifiedCount > 0;
}

async function forgotPassword(email) {
  const user = await users.findOne({ email });

  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        reset_password_token: token,
        reset_password_expires: Date.now() + 15 * 60 * 1000,
      },
    }
  );

  return token;
}

async function resetPassword(token, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await users.findOneAndUpdate(
    {
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() },
    },
    {
      $set: {
        password: hashedPassword,
      },
      $unset: {
        reset_password_token: "",
        reset_password_expires: "",
      },
    },
    { new: true }
  );

  if (!user) {
    throw new Error("Token inválido o expirado");
  }
}

async function addFcmToken(userId, token) {
  return users.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { fcmTokens: token } }
  );
}

async function removeFcmToken(userId, token) {
  return users.updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { fcmTokens: token } }
  );
}

async function removeInvalidFcmToken(token) {
  return users.updateMany(
    { fcmTokens: token },
    { $pull: { fcmTokens: token } }
  );
}

export {
  getUsers,
  getUserById,
  createUser,
  login,
  editUser,
  removeUser,
  getUserWithStats,
  getAllUsersWithStats,
  blockUser,
  unblockUser,
  forgotPassword,
  resetPassword,
  addFcmToken,
  removeFcmToken,
  removeInvalidFcmToken
};
