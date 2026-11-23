
import { Router } from "express";
import { serviceController } from "../controllers/service.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// Routes publiques
export const publicServiceRouter = Router();

publicServiceRouter.get("/", serviceController.getActive);
publicServiceRouter.get("/:id", serviceController.getById);

// Routes administrateur
export const adminServiceRouter = Router();

// Toutes les routes suivantes nécessitent un JWT admin valide
adminServiceRouter.use(authMiddleware);

adminServiceRouter.get("/", serviceController.getAllAdmin);
adminServiceRouter.get("/:id", serviceController.getByIdAdmin);
adminServiceRouter.post("/", serviceController.create);
adminServiceRouter.put("/:id", serviceController.update);
adminServiceRouter.delete("/:id", serviceController.remove);

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Soin du visage
 *         description:
 *           type: string
 *           nullable: true
 *           example: Soin nettoyant et hydratant
 *         durationMinutes:
 *           type: integer
 *           nullable: true
 *           example: 60
 *         price:
 *           type: number
 *           nullable: true
 *           example: 150
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *     ServiceInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Soin du visage
 *         description:
 *           type: string
 *           example: Soin nettoyant et hydratant
 *         durationMinutes:
 *           type: integer
 *           example: 60
 *         price:
 *           type: number
 *           example: 150
 *         isActive:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Consulter les services actifs
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Liste des services actifs
 */

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Consulter un service actif par ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service trouvé
 *       404:
 *         description: Service introuvable
 */

/**
 * @swagger
 * /api/admin/services:
 *   get:
 *     summary: Lister tous les services (administrateur)
 *     tags: [Administration Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste complète des services
 *       401:
 *         description: Authentification requise
 *
 *   post:
 *     summary: Créer un service
 *     tags: [Administration Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201:
 *         description: Service créé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Authentification requise
 */

/**
 * @swagger
 * /api/admin/services/{id}:
 *   get:
 *     summary: Consulter un service par ID (administrateur)
 *     tags: [Administration Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service trouvé
 *       404:
 *         description: Service introuvable
 *
 *   put:
 *     summary: Modifier un service
 *     tags: [Administration Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       200:
 *         description: Service modifié
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Service introuvable
 *
 *   delete:
 *     summary: Supprimer un service
 *     tags: [Administration Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Service supprimé
 *       404:
 *         description: Service introuvable
 */
