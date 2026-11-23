import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Route protégée par le middleware d'authentification admin
router.use(authMiddleware);

router.get("/stats", dashboardController.getStats);

export default router;
