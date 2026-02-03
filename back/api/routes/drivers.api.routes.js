import express from 'express';
import * as driversApiControllers from './../controllers/drivers.api.controllers.js'
import { validateDriver } from './../../middleware/forms.middleware.js';
import { multerControl } from '../../middleware/multer.middleware.js';
import { uploadContext } from "../../middleware/uploadContext.middleware.js";
import { mapImageToBody } from "../../middleware/mapImageToBody.middleware.js";
import { autenticado, admin } from '../../middleware/auth.middleware.js';

const router = express.Router()

router.route('/api/drivers')
    .get(driversApiControllers.findAll)
    .post(
        autenticado,
        admin,
        uploadContext("drivers"),
        multerControl.single("image"),
        mapImageToBody,
        validateDriver,
        driversApiControllers.create
    );

router.route('/api/drivers/:driverId')
    .get(driversApiControllers.findById)
    .delete(
        autenticado,
        admin,
        driversApiControllers.deleteById
    )
    .patch(
        autenticado,
        admin,
        uploadContext("drivers"),
        multerControl.single("image"),
        mapImageToBody,
        validateDriver,
        driversApiControllers.editById
    );

router.route("/api/dashboard/drivers/:driverId")
    .patch(
        autenticado,
        admin,
        driversApiControllers.editById
    );

router.route('/api/drivers/:driverId/used')
    .get(driversApiControllers.checkDriverUsedInRaces)

router.route('/api/drivers/:driverId/enabled')
    .patch(
        autenticado,
        admin,
        driversApiControllers.enableDriver
    );

router.route('/api/drivers/:driverId/disabled')
    .patch(
        autenticado,
        admin,
        driversApiControllers.disableDriver
    );



export default router