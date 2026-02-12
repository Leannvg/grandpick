import {ObjectId} from "mongodb"
import bcrypt from "bcrypt";
import crypto from "crypto";
import {connectDB} from "./db.services.js"


const db = await connectDB();
const users = db.collection('Users');
const predictions = db.collection("Predictions");
const usersPoints = db.collection("Users_Points");
const races = db.collection("Races");
const pointsSystem = db.collection("Points_System");


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

async function getUserWithStats(userId, racesInfo = null, psystems = null) {
  if (!ObjectId.isValid(userId)) {
    throw new Error("ID inválido");
  }

  if (!racesInfo) {
    racesInfo = await races.find({}).toArray();
  }
  if (!psystems) {
    psystems = await pointsSystem.find({}).toArray();
  }

  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return null;

  const preds = await predictions.find({ userId: new ObjectId(userId) }).toArray();
  const pointsByRace = await usersPoints.find({ userId: new ObjectId(userId) }).toArray();

  const stats = {
    predictions: { total: preds.length, qualifyng: 0, sprint: 0, race: 0 },
    successes: { total: 0, qualifyng: 0, sprint: 0, race: 0 },
    points: { total: 0, qualifyng: 0, sprint: 0, race: 0 }
  };

  for (const p of preds) {
    const race = racesInfo.find(r => r._id.toString() === p.raceId.toString());
    if (!race) continue;

    const ps = psystems.find(ps => ps._id.equals(race.points_system));
    const type = ps ? ps.type : "race";

    stats.predictions[type] = (stats.predictions[type] || 0) + 1;

    if (race.results && race.results.length > 0) {
      let successes = 0;
      for (const pred of p.prediction) {
        const result = race.results.find(r => r.position === pred.position);
        if (result && result.driver.toString() === pred.driver.toString()) {
          successes++;
        }
      }
      stats.successes.total += successes;
      stats.successes[type] = (stats.successes[type] || 0) + successes;
    }
  }

  for (const pb of pointsByRace) {
    const race = racesInfo.find(r => r._id.toString() === pb.raceId.toString());
    if (!race) continue;

    const ps = psystems.find(ps => ps._id.equals(race.points_system));
    const type = ps ? ps.type : "race";

    stats.points.total += pb.points;
    stats.points[type] = (stats.points[type] || 0) + pb.points;
  }

  return { ...user, stats };
}

async function getAllUsersWithStats() {
  const allUsers = await users.find().toArray();
  const racesInfo = await races.find({}).toArray();
  const psystems = await pointsSystem.find({}).toArray();

  const results = [];
  for (const u of allUsers) {
    const enriched = await getUserWithStats(u._id, racesInfo, psystems);
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
  resetPassword
};
