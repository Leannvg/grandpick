import * as circuitsServices from './../../services/circuits.services.js'
import { resolveImage } from '../../middleware/helpers.middleware.js'

export async function findAll(req, res){
    let circuits = await circuitsServices.findAllCircuits()
    res.status(200).json(circuits)
}

export async function findById(req, res) {
    let circuitId = req.params.circuitId
    
    let circuit = await circuitsServices.findCircuitById(circuitId)
    res.status(200).json(circuit)
}

export async function editById(req, res, next) {
  try {
    const circuitId = req.params.circuitId;
    const existingCircuit = await circuitsServices.findCircuitById(circuitId);

    const finalImage = resolveImage({
      file: req.file,
      currentImage: existingCircuit.img,
      folder: "circuits",
      defaultImage: "general/circuit_default.png",
    });

    const newCircuitData = {
      ...req.body,
      img: finalImage,
    };

    console.log("New Circuit Data:", newCircuitData);

    await circuitsServices.updateCircuit(circuitId, newCircuitData);
    const updatedCircuit = await circuitsServices.findCircuitById(circuitId);
    res.status(200).json(updatedCircuit);

  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const imgPath = resolveImage({
      file: req.file,
      folder: "circuits",
      defaultImage: "general/circuit_default.png",
    });

    const circuit = {
      circuit_name: req.body.circuit_name,
      country: req.body.country,
      img: imgPath,
      length: req.body.length,
      gp_name: req.body.gp_name,
      description: req.body.description,
      laps: req.body.laps,
      city: req.body.city,
      timezone: req.body.timezone,
    };

    const result = await circuitsServices.createCircuit(circuit);

    const newCircuit = await circuitsServices.findCircuitById(result.insertedId);

    res.status(201).json(newCircuit);

  } catch (err) {
    next(err);
  }
}



export async function deleteById(req, res) {
    const circuitId = req.params.circuitId;

    try {
        const result = await circuitsServices.deleteCircuit(circuitId);

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Circuito eliminado exitosamente." });
        } else {
            res.status(404).json({ message: "Circuito no encontrado." });
        }
    } catch (error) {
        console.error("Error al eliminar circuito:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
}
