
import { Router } from "express";

import { stockController } from "../controllers/stock.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Toutes les opérations de stock nécessitent une authentification
router.use(authMiddleware);

router.get("/", stockController.getAll);

router.patch("/:id/restock", stockController.restock);

router.patch("/:id/adjust", stockController.adjust);

export default router;
