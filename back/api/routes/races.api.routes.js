import express from 'express';
import * as racesApiControllers from '../controllers/races.api.controllers.js'
import { validateRace } from './../../middleware/forms.middleware.js';
import { autenticado, admin } from '../../middleware/auth.middleware.js';

const router = express.Router()

router.route('/api/races/current-or-next')
    .get(racesApiControllers.findCurrentOrNext);

router.route('/api/races/next')
    .get(racesApiControllers.findNext);

router.route('/api/races')
    .get(racesApiControllers.findAll)
    .post(
        autenticado,
        admin,
        validateRace,
        racesApiControllers.create
    );

router.route('/api/races/year/:year')
    .get(racesApiControllers.findAllByYear);

router.route('/api/races/:raceId')
    .get(racesApiControllers.findById)
    .patch(
        autenticado,
        admin,
        validateRace,
        racesApiControllers.editById
    )
    .delete(
        autenticado,
        admin,
        racesApiControllers.deleteById
    );

router.route('/api/races/circuit/:circuitId/year/:year')
    .get(racesApiControllers.findByCircuitAndYear);

    

export default router