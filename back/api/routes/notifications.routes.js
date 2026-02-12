import { Router } from "express";
import { getMyNotifications, markAsSeen, deleteNotification } from "../controllers/notifications.controllers.js";
import {autenticado} from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/me", autenticado, getMyNotifications);
router.patch("/:id/seen", autenticado, markAsSeen);
router.delete("/:id", autenticado, deleteNotification);

export default router;
