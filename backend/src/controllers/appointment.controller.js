
import { appointmentService } from "../services/appointment.service.js";

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const appointmentController = {
  create: asyncHandler(async (req, res) => {
    const appointment = await appointmentService.create(
      req.body
    );

    return res.status(201).json({
      id: appointment.id,
      customerName: appointment.customerName,
      phone: appointment.phone,
      status: appointment.status,
      createdAt: appointment.createdAt,
      service: {
        id: appointment.slot.service.id,
        name: appointment.slot.service.name,
      },
      slot: {
        id: appointment.slot.id,
        startAt: appointment.slot.startAt,
        endAt: appointment.slot.endAt,
      },
    });
  }),

  availableSlots: asyncHandler(async (req, res) => {
    const slots = await appointmentService.availableSlots(
      req.params.serviceId
    );

    return res.status(200).json(slots);
  }),
};
