import express from 'express';
import * as circuitsApiControllers from './../controllers/circuits.api.controllers.js'
import { validateCircuit } from './../../middleware/forms.middleware.js';
import { multerControl } from '../../middleware/multer.middleware.js';
import { uploadContext } from "../../middleware/uploadContext.middleware.js";
import { mapImageToBody } from "../../middleware/mapImageToBody.middleware.js";
import { autenticado, admin } from '../../middleware/auth.middleware.js';

const router = express.Router()


router.route('/api/circuits')
    .get(circuitsApiControllers.findAll)
    .post(
        autenticado,
        admin,
        uploadContext("circuits"),
        multerControl.single("image"),
        mapImageToBody,
        validateCircuit,
        circuitsApiControllers.create
    );

router.route('/api/circuits/:circuitId')
    .get(circuitsApiControllers.findById)
    .delete(
        autenticado,
        admin,
        circuitsApiControllers.deleteById
    )
    .patch(
        autenticado,
        admin,
        uploadContext("circuits"),
        multerControl.single("image"),
        mapImageToBody,
        validateCircuit,
        circuitsApiControllers.editById
    )

export default router