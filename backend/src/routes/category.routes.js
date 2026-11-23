
import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", authMiddleware, categoryController.create);
router.put("/:id", authMiddleware, categoryController.update);
router.delete("/:id", authMiddleware, categoryController.remove);

export default router;
