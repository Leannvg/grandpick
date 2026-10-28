import {ObjectId} from "mongodb"
import {connectDB} from "./db.services.js"

export async function findAllDrivers() {
    try {
        const db = await connectDB();
        const drivers = await db.collection("Drivers").aggregate([
            {
                $lookup: {
                    from: "Teams",
                    localField: "team",
                    foreignField: "_id",
                    as: "team_info"
                }
            },
            {
                $unwind: {
                    path: "$team_info",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).toArray();

        return drivers;
    } catch (err) {
        console.error("Error al obtener todos los pilotos:", err);
        throw err;
    }
}


export async function findDriverById(driverId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Drivers").aggregate([
            { $match: { _id: new ObjectId(driverId) } },
            {
                $lookup: {
                    from: "Teams",
                    localField: "team",
                    foreignField: "_id",
                    as: "team_info"
                }
            },

            { $unwind: { path: "$team_info", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        if (result.length === 0) {
            throw new Error("No se encontró ningún piloto con el ID proporcionado.");
        }

        return result[0];
    } catch (err) {
        console.error("Error al buscar piloto:", err);
        throw err;
    }
}




export async function createDriver(driver) {
    try {
        const db = await connectDB();
        const result = await db.collection("Drivers").insertOne(driver);
        return { message: "Piloto creado exitosamente", result };
    } catch (err) {
        console.error("Error al crear piloto:", err);
        throw err;
    }
}


/**
 * Normaliza el valor de `team` que llega de un form/payload a `ObjectId | null`.
 * Compartido por `updateDriver` y `updateDriverAssignments`.
 */
function normalizeTeamValue(teamVal) {
    if (teamVal === null || teamVal === undefined || teamVal === "") {
        return null;
    }
    if (teamVal instanceof ObjectId) {
        return teamVal;
    }
    if (typeof teamVal === "string") {
        if (!ObjectId.isValid(teamVal)) {
            throw new Error("El ID del equipo no es válido.");
        }
        return new ObjectId(teamVal);
    }
    return null;
}

export async function updateDriver(driverId, newDriver) {
    try {
        const db = await connectDB();

        if (newDriver.hasOwnProperty("team")) {
            newDriver.team = normalizeTeamValue(newDriver.team);
        }

        const result = await db.collection("Drivers").updateOne(
            { _id: new ObjectId(driverId) },
            { $set: newDriver }
        );

        if (result.modifiedCount > 0) {
            return "Piloto actualizado exitosamente.";
        } else {
            return "No se realizaron cambios.";
        }
    } catch (err) {
        console.error("Error al actualizar el piloto:", err);
        throw err;
    }
}



/**
 * Guarda en lote los cambios de la pantalla de Asignaciones (team + role por
 * piloto). Antes de escribir nada, valida el estado resultante completo
 * (snapshot actual + cambios propuestos) contra la regla de negocio: un
 * equipo no puede tener más de 2 pilotos con role "titular" a la vez.
 *
 * No es una transacción multi-documento (el proyecto no usa sessions de
 * Mongo en ningún otro lado) — el pre-chequeo sobre un snapshot único cubre
 * el caso real (un admin guardando varios cambios juntos desde esta misma
 * pantalla); dos admins guardando en el mismo instante exacto queda fuera
 * de alcance, igual que estaba antes de este cambio (la ruta anterior no
 * validaba nada en absoluto).
 *
 * @param {Array<{driverId: string, team: string|null, role: string|null}>} updates
 */
export async function updateDriverAssignments(updates) {
    try {
        const db = await connectDB();

        const allDrivers = await db.collection("Drivers").find({}).toArray();
        const byId = new Map(allDrivers.map((d) => [d._id.toString(), d]));

        const normalizedUpdates = updates.map((u) => {
            if (!byId.has(u.driverId)) {
                throw new Error(`No se encontró ningún piloto con el ID ${u.driverId}.`);
            }
            return {
                driverId: u.driverId,
                team: normalizeTeamValue(u.team),
                role: u.role || null,
            };
        });
        const updatesById = new Map(normalizedUpdates.map((u) => [u.driverId, u]));

        // Estado resultante: snapshot actual + cambios propuestos superpuestos.
        const resulting = allDrivers.map((d) => {
            const change = updatesById.get(d._id.toString());
            return {
                team: change ? change.team : (d.team ?? null),
                role: change ? change.role : (d.role ?? null),
            };
        });

        const titularCounts = new Map();
        resulting.forEach(({ team, role }) => {
            if (team && role === "titular") {
                const key = team.toString();
                titularCounts.set(key, (titularCounts.get(key) || 0) + 1);
            }
        });

        const overLimitTeamIds = [...titularCounts.entries()]
            .filter(([, count]) => count > 2)
            .map(([teamId]) => teamId);

        if (overLimitTeamIds.length > 0) {
            const teams = await db.collection("Teams").find({
                _id: { $in: overLimitTeamIds.map((id) => new ObjectId(id)) }
            }).toArray();
            const names = teams.map((t) => t.name).join(", ");
            const err = new Error(`No puede haber más de 2 titulares en: ${names}.`);
            err.status = 400;
            throw err;
        }

        for (const update of normalizedUpdates) {
            await db.collection("Drivers").updateOne(
                { _id: new ObjectId(update.driverId) },
                { $set: { team: update.team, role: update.role } }
            );
        }

        return { message: "Asignaciones actualizadas exitosamente." };
    } catch (err) {
        console.error("Error al actualizar asignaciones de pilotos:", err);
        throw err;
    }
}

export async function deleteDriver(driverId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Drivers").deleteOne({
            _id: new ObjectId(driverId)
        });

        return result;
    } catch (err) {
        console.error("Error al eliminar el piloto:", err);
        throw err;
    }
}

export async function isDriverUsedInRaces(driverId) {
    try {
        const db = await connectDB();

        const result = await db.collection("Races").aggregate([
            { $unwind: "$results" },
            { $match: { "results.driver": new ObjectId(driverId) } },
            { $limit: 1 }
        ]).toArray();

        return result.length > 0;
    } catch (err) {
        console.error("Error al verificar si el piloto está usado en carreras:", err);
        throw err;
    }
}

/**
 * Arma la tabla de puntos (clasificación) de pilotos de una temporada.
 * Suma únicamente los resultados de sesiones que otorgan puntos al campeonato:
 * Carrera y Sprint (la Qualy no otorga puntos, igual que en la F1 real).
 *
 * @param {number|string} year - Año de la temporada. Por defecto el año actual.
 * @returns {Promise<Array>} Pilotos ordenados por puntos (desc), con posición asignada.
 */
export async function findDriversStandings(year) {
    try {
        const db = await connectDB();

        const season = Number(year) || new Date().getFullYear();
        const start = new Date(`${season}-01-01T00:00:00.000Z`);
        const end = new Date(`${season + 1}-01-01T00:00:00.000Z`);

        // Sistemas de puntos que suman al campeonato de pilotos
        const SCORING_TYPES = ["race", "sprint"];

        const pointsSystems = await db.collection("Points_System").find().toArray();
        const pointsSystemsMap = {};
        pointsSystems.forEach((ps) => {
            pointsSystemsMap[ps._id.toString()] = ps;
        });

        // Carreras de la temporada que ya tienen resultados cargados
        const races = await db.collection("Races").find({
            date_gp_start: { $gte: start, $lt: end },
            "results.0": { $exists: true }
        }).toArray();

        const pointsByDriver = {};
        for (const race of races) {
            const ps = pointsSystemsMap[race.points_system?.toString()];
            if (!ps || !Array.isArray(ps.points) || !SCORING_TYPES.includes(ps.type)) continue;

            for (const result of race.results) {
                if (!result?.driver) continue;
                const earned = ps.points[result.position - 1] || 0;
                const driverId = result.driver.toString();
                pointsByDriver[driverId] = (pointsByDriver[driverId] || 0) + earned;
            }
        }

        const drivers = await db.collection("Drivers").aggregate([
            {
                $lookup: {
                    from: "Teams",
                    localField: "team",
                    foreignField: "_id",
                    as: "team_info"
                }
            },
            { $unwind: { path: "$team_info", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        const standings = drivers
            .map((d) => ({
                _id: d._id,
                full_name: d.full_name,
                country: d.country,
                trigram: d.trigram,
                number: d.number,
                img: d.img,
                active: d.active,
                team: d.team_info
                    ? {
                        _id: d.team_info._id,
                        name: d.team_info.name,
                        full_team_name: d.team_info.full_team_name,
                        color: d.team_info.color
                    }
                    : null,
                points: pointsByDriver[d._id.toString()] || 0
            }))
            // Mostramos a quienes sumaron puntos o siguen activos en la temporada
            .filter((d) => d.points > 0 || d.active)
            .sort((a, b) => b.points - a.points || a.full_name.localeCompare(b.full_name));

        standings.forEach((d, index) => {
            d.position = index + 1;
        });

        return standings;
    } catch (err) {
        console.error("Error al armar la clasificación de pilotos:", err);
        throw err;
    }
}


export async function setDriverEnabledStatus(driverId, isEnabled) {
    try {
        const db = await connectDB();
        const result = await db.collection("Drivers").updateOne(
            { _id: new ObjectId(driverId) },
            { $set: { active: isEnabled } }
        );
        return result; 
    } catch (err) {
        console.error("Error al actualizar el estado del piloto:", err);
        throw err;
    }
}