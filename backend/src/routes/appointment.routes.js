
import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller.js";

const appointmentRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Réservations
 *     description: Gestion des réservations de services sans compte
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Réservations]
 *     summary: Réserver un créneau sans compte
 *     description: >
 *       Crée une réservation avec le statut PENDING.
 *       Une réservation PENDING bloque immédiatement le créneau.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *               - customerName
 *               - phone
 *             properties:
 *               slotId:
 *                 type: string
 *                 format: uuid
 *               customerName:
 *                 type: string
 *                 example: Sara El Amrani
 *               phone:
 *                 type: string
 *                 example: "0612345678"
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Créneau introuvable
 *       409:
 *         description: Créneau déjà réservé ou indisponible
 */
appointmentRoutes.post(
  "/",
  appointmentController.create
);

/**
 * @swagger
 * /api/appointments/available-slots/{serviceId}:
 *   get:
 *     tags: [Réservations]
 *     summary: Consulter les créneaux disponibles d'un service
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des créneaux disponibles
 *       400:
 *         description: Identifiant invalide
 *       404:
 *         description: Service introuvable ou inactif
 */
appointmentRoutes.get(
  "/available-slots/:serviceId",
  appointmentController.availableSlots
);

export default appointmentRoutes;
