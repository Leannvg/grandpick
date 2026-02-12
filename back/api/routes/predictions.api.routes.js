import express from 'express';
import * as predictionsApiControllers from './../controllers/predictions.api.controllers.js'
import { autenticado, admin, selfOrAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router()

router.route('/api/predictions')
    .get(
        autenticado,
        predictionsApiControllers.findAll
    )
    .post(
        autenticado, // crear predicción → usuario logueado
        predictionsApiControllers.create
    );

router.route('/api/predictions/:predictionId')
    .get(
        autenticado,
        predictionsApiControllers.findById
    )
    .patch(
        autenticado,
        predictionsApiControllers.editById
    );

router.route('/api/users/:UserId/predictions')
    .get(
        autenticado,
        predictionsApiControllers.findByUserId
    );

router.route('/api/races/:RaceId/predictions')
    .get(predictionsApiControllers.findByRaceId)

router.route('/api/users/:UserId/predictions/:RaceId')
    .get(
        autenticado,
        predictionsApiControllers.findByUserAndRace
    );

export default router