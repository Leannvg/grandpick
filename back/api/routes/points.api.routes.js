import express from 'express';
import * as pointsApiControllers from './../controllers/points.api.controllers.js'
import { autenticado } from '../../middleware/auth.middleware.js';

const router = express.Router()

router.route('/api/points')
    .get(
        autenticado,
        pointsApiControllers.findAll)

export default router