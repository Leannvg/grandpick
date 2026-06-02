import { Router } from "express";
import { getMyNotifications, markAsSeen, deleteNotification, sendAdminNotification, markAllAsSeen, deleteAllNotifications } from "../controllers/notifications.controllers.js";
import { autenticado, admin } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/me", autenticado, getMyNotifications);
router.patch("/seen-all", autenticado, markAllAsSeen);
router.patch("/:id/seen", autenticado, markAsSeen);
router.delete("/all", autenticado, deleteAllNotifications);
router.delete("/:id", autenticado, deleteNotification);
router.post("/send", autenticado, admin, sendAdminNotification);

export default router;
