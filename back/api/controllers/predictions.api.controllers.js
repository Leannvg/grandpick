import * as predictionsServices from './../../services/predictions.services.js'
import {ObjectId} from "mongodb"

export async function findAll(req, res){
    let productos = await predictionsServices.findAllPredictions()
    res.status(200).json(productos)
}

export async function findById(req, res) {
    let predictionId = req.params.predictionId
    
    let prediction = await predictionsServices.findPredictionById(predictionId)
    res.status(200).json(prediction)
}

export async function editById(req, res) {
    const predictionId = req.params.predictionId;

    const newPrediction = req.body.prediction.map(item => ({
        position: item.position,
        driver: new ObjectId(item.driver)
    }));

    try {
        const prediction = await predictionsServices.updatePrediction(predictionId, newPrediction);
        res.status(200).json(prediction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function create(req, res) {

    const prediction = {
        raceId: new ObjectId(req.body.race_id),
        userId: new ObjectId(req.body.user_id),
        prediction: req.body.prediction.map(item => ({
            position: item.position,
            driver: new ObjectId(item.driver)
        })),
        date_prediction: new Date()
    };

    const predictions = await predictionsServices.createPrediction(prediction);

    res.status(200).json(predictions);
}

export async function findByUserId(req, res) {
    const { UserId } = req.params;
    try {
        const predictions = await predictionsServices.findPredictionsByUserId(UserId);
        if (!predictions || predictions.length === 0) {
            return res.status(404).json({ message: "No se encontraron predicciones para este usuario" });
        }
        res.status(200).json(predictions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function findByRaceId(req, res) {
    const { RaceId } = req.params;
    try {
        const predictions = await predictionsServices.findPredictionsByRaceId(RaceId);
        if (!predictions || predictions.length === 0) {
            return res.status(404).json({ message: "No se encontraron predicciones para esta carrera" });
        }
        res.status(200).json(predictions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function findByUserAndRace(req, res) {
    const { UserId, RaceId } = req.params;
    try {
        const prediction = await predictionsServices.findPredictionByUserAndRace(UserId, RaceId);
        if (!prediction) {
            return res.status(404).json({ message: "No existe predicción para este usuario y carrera" });
        }
        res.status(200).json(prediction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
