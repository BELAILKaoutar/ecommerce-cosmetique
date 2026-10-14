
import express from "express";
import categoryRoutes from "./routes/category.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

// Route d'accueil
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bienvenue sur l'API E-commerce Cosmétique",
    status: "OK",
  });
});

// Routes des catégories
app.use("/api/categories", categoryRoutes);

// Gestion des erreurs
app.use(errorMiddleware);

export default app;
