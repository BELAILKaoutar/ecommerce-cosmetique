import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const publicOrderRouter = Router();
export const adminOrderRouter = Router();

publicOrderRouter.post("/", orderController.create);
publicOrderRouter.get("/:id", orderController.getById);

adminOrderRouter.use(authMiddleware);
adminOrderRouter.get("/", orderController.list);
adminOrderRouter.get("/:id", orderController.getById);
adminOrderRouter.post("/:id/confirm", orderController.confirm);
adminOrderRouter.post("/:id/cancel", orderController.cancel);
adminOrderRouter.patch("/:id/status", orderController.updateStatus);
