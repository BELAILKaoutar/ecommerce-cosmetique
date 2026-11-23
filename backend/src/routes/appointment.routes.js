import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const appointmentRoutes = Router();
export const adminAppointmentRouter = Router();

// Routes publiques
appointmentRoutes.get("/available-dates", appointmentController.availableDates);
appointmentRoutes.get("/available-slots", appointmentController.slotsForDate);
appointmentRoutes.post("/", appointmentController.create);
appointmentRoutes.get(
  "/available-slots/:serviceId",
  appointmentController.availableSlots
);

// Routes administration
adminAppointmentRouter.use(authMiddleware);
adminAppointmentRouter.get("/", appointmentController.list);
adminAppointmentRouter.get("/:id", appointmentController.getById);
adminAppointmentRouter.patch("/:id/status", appointmentController.updateStatus);
adminAppointmentRouter.post("/:id/confirm", appointmentController.confirm);
adminAppointmentRouter.post("/:id/cancel", appointmentController.cancel);

export default appointmentRoutes;
