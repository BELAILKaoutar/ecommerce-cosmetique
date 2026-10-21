
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger.js";

import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";

import {
  adminOrderRouter,
  publicOrderRouter,
} from "./routes/order.routes.js";

import {
  publicServiceRouter,
  adminServiceRouter,
} from "./routes/service.routes.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Configuration CORS
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  })
);

// Lecture des requêtes JSON
app.use(express.json());

// Documentation Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Route d'accueil
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bienvenue sur l'API E-commerce Cosmétique",
    status: "OK",
  });
});

// Authentification
app.use("/api/auth", authRoutes);

// Catégories
app.use("/api/categories", categoryRoutes);

// Produits
app.use("/api/products", productRoutes);

// Commandes
app.use("/api/orders", publicOrderRouter);
app.use("/api/admin/orders", adminOrderRouter);

// Services
app.use("/api/services", publicServiceRouter);
app.use("/api/admin/services", adminServiceRouter);

// Gestion globale des erreurs
app.use(errorMiddleware);

export default app;
