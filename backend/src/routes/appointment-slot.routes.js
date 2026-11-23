
import { Router } from "express";
import { appointmentSlotController as controller } from "../controllers/appointment-slot.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const publicAppointmentSlotRouter = Router();
export const adminAppointmentSlotRouter = Router();

adminAppointmentSlotRouter.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   - name: Créneaux
 *     description: Consultation publique des créneaux
 *   - name: Administration Créneaux
 *     description: Gestion des créneaux par l'administrateur
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentSlotInput:
 *       type: object
 *       required:
 *         - serviceId
 *         - startAt
 *         - endAt
 *       properties:
 *         serviceId:
 *           type: string
 *           format: uuid
 *         startAt:
 *           type: string
 *           format: date-time
 *           example: "2026-10-25T10:00:00+01:00"
 *         endAt:
 *           type: string
 *           format: date-time
 *           example: "2026-10-25T11:00:00+01:00"
 *         capacity:
 *           type: integer
 *           enum: [1]
 *           default: 1
 *         isActive:
 *           type: boolean
 *           default: true
 *
 *     AppointmentSlot:
 *       allOf:
 *         - $ref: '#/components/schemas/AppointmentSlotInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *   parameters:
 *     AppointmentSlotId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 */

/**
 * @swagger
 * /api/appointment-slots:
 *   get:
 *     tags: [Créneaux]
 *     summary: Lister les créneaux publics actifs et futurs
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des créneaux
 *       400:
 *         description: Filtre invalide
 */
publicAppointmentSlotRouter.get(
  "/",
  controller.listPublic
);

/**
 * @swagger
 * /api/appointment-slots/{id}:
 *   get:
 *     tags: [Créneaux]
 *     summary: Consulter un créneau public
 *     parameters:
 *       - $ref: '#/components/parameters/AppointmentSlotId'
 *     responses:
 *       200:
 *         description: Créneau trouvé
 *       404:
 *         description: Créneau indisponible
 */
publicAppointmentSlotRouter.get(
  "/:id",
  controller.getPublicById
);

/**
 * @swagger
 * /api/admin/appointment-slots:
 *   get:
 *     tags: [Administration Créneaux]
 *     summary: Lister tous les créneaux
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste complète
 *       401:
 *         description: Non authentifié
 *
 *   post:
 *     tags: [Administration Créneaux]
 *     summary: Créer un créneau
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentSlotInput'
 *     responses:
 *       201:
 *         description: Créneau créé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       409:
 *         description: Chevauchement avec un autre créneau
 */
adminAppointmentSlotRouter.get(
  "/",
  controller.listAdmin
);

adminAppointmentSlotRouter.post(
  "/",
  controller.create
);

/**
 * @swagger
 * /api/admin/appointment-slots/{id}:
 *   get:
 *     tags: [Administration Créneaux]
 *     summary: Consulter un créneau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AppointmentSlotId'
 *     responses:
 *       200:
 *         description: Créneau trouvé
 *       404:
 *         description: Créneau introuvable
 *
 *   put:
 *     tags: [Administration Créneaux]
 *     summary: Modifier un créneau
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AppointmentSlotId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               endAt:
 *                 type: string
 *                 format: date-time
 *               capacity:
 *                 type: integer
 *                 enum: [1]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Créneau modifié
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Créneau introuvable
 *       409:
 *         description: Chevauchement
 *
 *   delete:
 *     tags: [Administration Créneaux]
 *     summary: Désactiver un créneau
 *     description: Suppression logique, sans effacer la ligne en base.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AppointmentSlotId'
 *     responses:
 *       200:
 *         description: Créneau désactivé
 *       404:
 *         description: Créneau introuvable
 */
adminAppointmentSlotRouter.get(
  "/:id",
  controller.getAdminById
);

adminAppointmentSlotRouter.put(
  "/:id",
  controller.update
);

adminAppointmentSlotRouter.delete(
  "/:id",
  controller.remove
);
