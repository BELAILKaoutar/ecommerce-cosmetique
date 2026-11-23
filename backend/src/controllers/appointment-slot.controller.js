
import { appointmentSlotService } from "../services/appointment-slot.service.js";

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const appointmentSlotController = {
  listPublic: asyncHandler(async (req, res) => {
    const slots = await appointmentSlotService.listPublic(
      req.query.serviceId
    );

    res.status(200).json(slots);
  }),

  getPublicById: asyncHandler(async (req, res) => {
    const slot = await appointmentSlotService.getPublicById(
      req.params.id
    );

    res.status(200).json(slot);
  }),

  listAdmin: asyncHandler(async (req, res) => {
    const slots = await appointmentSlotService.listAdmin();

    res.status(200).json(slots);
  }),

  getAdminById: asyncHandler(async (req, res) => {
    const slot = await appointmentSlotService.getAdminById(
      req.params.id
    );

    res.status(200).json(slot);
  }),

  create: asyncHandler(async (req, res) => {
    const slot = await appointmentSlotService.create(req.body);

    res.status(201).json(slot);
  }),

  update: asyncHandler(async (req, res) => {
    const slot = await appointmentSlotService.update(
      req.params.id,
      req.body
    );

    res.status(200).json(slot);
  }),

  remove: asyncHandler(async (req, res) => {
    const slot = await appointmentSlotService.remove(
      req.params.id
    );

    res.status(200).json({
      message: "Créneau désactivé avec succès.",
      slot,
    });
  }),
};
