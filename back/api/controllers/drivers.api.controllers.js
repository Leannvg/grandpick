import * as driversServices from './../../services/drivers.services.js'
import { resolveImage } from '../../middleware/helpers.middleware.js'

export async function findAll(req, res){
    let drivers = await driversServices.findAllDrivers()
    res.status(200).json(drivers)
}

export async function findById(req, res) {
    let driverId = req.params.driverId
    
    let driver = await driversServices.findDriverById(driverId)
    res.status(200).json(driver)
}

export async function editById(req, res, next) {
  try {
    const driverId = req.params.driverId;
    const existingDriver = await driversServices.findDriverById(driverId);

    const finalImage = resolveImage({
      file: req.file,
      currentImage: existingDriver.img,
      folder: "drivers",
      defaultImage: "general/profile_default.png",
    });

    const newDriverData = {
      ...req.body,
      img: finalImage,
    };

    await driversServices.updateDriver(driverId, newDriverData);
    const updatedDriver = await driversServices.findDriverById(driverId);

    res.status(200).json(updatedDriver);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const imgPath = resolveImage({
      file: req.file,
      folder: "drivers",
      defaultImage: "general/profile_default.png",
    });

    const driver = {
      full_name: req.body.full_name,
      country: req.body.country,
      trigram: req.body.trigram,
      img: imgPath,
      number: req.body.number,
      active: true,
      team: null,
    };

    const result = await driversServices.createDriver(driver);
    console.log(result);
    /* const newDriver = await driversServices.findDriverById(result.insertedId);
    console.log(newDriver); */

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}


export async function deleteById(req, res) {
    const driverId = req.params.driverId;

    try {
        const result = await driversServices.deleteDriver(driverId);

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Piloto eliminado exitosamente." });
        } else {
            res.status(404).json({ message: "Piloto no encontrado." });
        }
    } catch (error) {
        console.error("Error al eliminar el piloto:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
}

export async function checkDriverUsedInRaces(req, res) {
    const driverId = req.params.driverId;

    try {
        const result = await driversServices.isDriverUsedInRaces(driverId);
        res.status(200).json({ used: result });
    } catch (error) {
        console.error("Error al verificar si el piloto está usado en carreras:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }   
}

export async function enableDriver(req, res) {
    const driverId = req.params.driverId;

    try {
        const result = await driversServices.setDriverEnabledStatus(driverId, true);
        res.status(200).json({ message: "Piloto habilitado exitosamente." });
    } catch (error) {
        console.error("Error al habilitar el piloto:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
}

export async function disableDriver(req, res) {
    const driverId = req.params.driverId;

    try {
        const result = await driversServices.setDriverEnabledStatus(driverId, false);
        res.status(200).json({ message: "Piloto deshabilitado exitosamente." });
    } catch (error) {
        console.error("Error al deshabilitar el piloto:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
}