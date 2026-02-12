import * as usersServices from './../../services/users.services.js'
import * as pointsServices from './../../services/points.services.js'
import * as racesServices from './../../services/races.services.js'
/* import * as notificationsServices from "../../services/notifications.services.js"; */
import { sendGlobalNotification } from "./../../services/realtimeNotifications.services.js";
import {ObjectId} from "mongodb"

export async function findAll(req, res) {
    try {
        const races = await racesServices.findAllRaces();
        res.status(200).json(races);
    } catch (error) {
        console.error("Error en findAll:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function findAllByYear(req, res) {
    try {
        const year = req.params.year
        const races = await racesServices.findAllRacesByYear(year);
        res.status(200).json(races);
    } catch (error) {
        console.error("Error en findAllByYear:", error);
        res.status(500).json({ error: error.message });
    }
}


export async function findNext(req, res) {
    try {
        const races = await racesServices.findNextRace();
        res.status(200).json(races);
    } catch (error) {
        console.error("Error en findNext:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function findCurrentOrNext(req, res) {
  try {
    const race = await racesServices.findCurrentOrNextRace();
    res.status(200).json(race);
  } catch (error) {
    console.error("Error en findCurrentOrNext:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function findById(req, res) {
    try {
        const raceId = req.params.raceId;
        const race = await racesServices.findRaceById(raceId);
        res.status(200).json(race);
    } catch (error) {
        console.error("Error en findById:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function create(req, res) {
    try {
        const newRace = {
            id_circuit: new ObjectId(req.body.id_circuit),
            date_gp_start: new Date(req.body.date_gp_start),
            date_gp_end: new Date(req.body.date_gp_end),
            points_system: new ObjectId(req.body.points_system),
            date_race: new Date(req.body.date_race),
            state: "Pendiente",
            results: []
        };


        // Si el front no manda results (escenario 1), se guarda como [].
        // Si el front manda results con pilotos cargados (escenario 2), se guardan en la DB.
        // Si manda results pero vacíos (driver: null o "" en todos), queda [].

        if (Array.isArray(req.body.results) && req.body.results.some(r => r?.driver)) {
            newRace.results = req.body.results.map(r => ({
                position: r.position,
                driver: r.driver ? new ObjectId(r.driver) : null,
            }));
            newRace.state = "Finalizado";
        }

        const race = await racesServices.createRace(newRace);
        await sendGlobalNotification(req.app, {
            title: "Nueva carrera creada",
            message: "Ya podés predecir tus proximos resultados",
            link: `/predictions`,
            type: "success"
        });
        res.status(200).json(race);
    } catch (error) {
        console.error("Error al crear la carrera:", error);
        res.status(500).json({ error: error.message });
    }
}


export async function editById(req, res) {
    try {

        const raceId = req.params.raceId;
        const data = req.body
        const updates = {};
        
        if (data.id_circuit) updates.id_circuit = new ObjectId(data.id_circuit);
        if (data.date_gp_start) updates.date_gp_start = new Date(data.date_gp_start);
        if (data.date_gp_end) updates.date_gp_end = new Date(data.date_gp_end);
        if (data.points_system) updates.points_system = new ObjectId(data.points_system);
        if (data.date_race) updates.date_race = new Date(data.date_race);
        if (data.state) updates.state = data.state;

        if (data.results) {
        const hasAnyDriver = data.results.some(r => r.driver);
        updates.results = hasAnyDriver
            ? data.results.map(r => ({
                position: r.position,
                driver: new ObjectId(r.driver)
            }))
            : [];
        }

        if(updates.results && updates.results.length > 0 && updates.state !== "Finalizado") {
            updates.state = "Finalizado"
        }

        const updateResult = await racesServices.updateRaceById(raceId, updates);

        if (updateResult.modifiedCount === 0) {
            console.log("No se realizaron cambios en la carrera.");
            return res.status(200).json({ message: "No se realizaron cambios." });
        }

        const resultsWereUpdated =
        Array.isArray(updates.results) && updates.results.length > 0;

        if (resultsWereUpdated) {
            updates.state = "Finalizado";
            await pointsServices.updatePointsAfterRace(raceId);

            await sendGlobalNotification(req.app, {
                title: "Resultados disponibles",
                message: "Ya podés revisar los resultados de la carrera",
                link: `/results/${raceId}`,
                type: "success"
            });
        }

        res.status(200).json({ message: "Carrera actualizada correctamente." });
    } catch (error) {
        console.error("Error al editar la carrera:", error);
        res.status(500).json({ error: error.message });
    }
}


export async function findByCircuitAndYear(req, res) {
    try {
        const { circuitId, year } = req.params;
        const races = await racesServices.findByCircuitAndYear(circuitId, parseInt(year));
        res.status(200).json(races);
    } catch (error) {
        console.error("Error en findByCircuitAndYear:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function deleteById(req, res) {
    try {
        const raceId = req.params.raceId;
        const deleteResult = await racesServices.deleteRaceById(raceId);

        console.log(deleteResult)
        res.status(200).json({ message: "Carrera eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar la carrera:", error);
        res.status(500).json({ error: error.message });
    }
}  