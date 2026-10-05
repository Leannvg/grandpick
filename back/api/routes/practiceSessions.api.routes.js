import express from "express";
import * as practiceSessionsApiControllers from "../controllers/practiceSessions.api.controllers.js";
import { autenticado, admin } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.route("/api/practice-sessions")
    .get(practiceSessionsApiControllers.findAll);

router.route("/api/dashboard/practice-sessions/:circuitId/:year")
    .put(autenticado, admin, practiceSessionsApiControllers.replaceForCircuit);

export default router;
