import { appointmentService } from "../services/appointment.service.js";

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const appointmentController = {
  create: asyncHandler(async (req, res) => {
    const appointment = await appointmentService.create(req.body);

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

  list: asyncHandler(async (req, res) => {
    const appointments = await appointmentService.list(req.query);
    return res.status(200).json(appointments);
  }),

  getById: asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getById(req.params.id);
    return res.status(200).json(appointment);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const appointment = await appointmentService.updateStatus(
      req.params.id,
      req.body?.status
    );
    return res.status(200).json(appointment);
  }),

  confirm: asyncHandler(async (req, res) => {
    const appointment = await appointmentService.confirm(req.params.id);
    return res.status(200).json(appointment);
  }),

  cancel: asyncHandler(async (req, res) => {
    const appointment = await appointmentService.cancel(req.params.id);
    return res.status(200).json(appointment);
  }),

  availableDates: asyncHandler(async (req, res) => {
    const dates = await appointmentService.getAvailableDates();
    return res.status(200).json(dates);
  }),

  slotsForDate: asyncHandler(async (req, res) => {
    const slots = await appointmentService.getSlotsForDate(req.query.date);
    return res.status(200).json(slots);
  }),
};
