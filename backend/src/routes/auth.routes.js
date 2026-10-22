
import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Connexion administrateur
 *     description: Authentifie un administrateur et retourne un token JWT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: VotreMotDePasse
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Identifiants incorrects
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentification
 *     summary: Consulter le profil administrateur connecté
 *     description: Retourne les informations de l'administrateur authentifié.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Administrateur authentifié
 *       401:
 *         description: Token absent, invalide ou expiré
 */
router.get("/me", authMiddleware, authController.me);

export default router;
