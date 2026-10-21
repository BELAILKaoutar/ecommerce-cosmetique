
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

import {
  publicAppointmentSlotRouter,
  adminAppointmentSlotRouter,
} from "./routes/appointment-slot.routes.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  })
);

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bienvenue sur l'API E-commerce Cosmétique",
    status: "OK",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.use("/api/orders", publicOrderRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/services", publicServiceRouter);
app.use("/api/admin/services", adminServiceRouter);

app.use("/api/appointment-slots", publicAppointmentSlotRouter);
app.use("/api/admin/appointment-slots", adminAppointmentSlotRouter);

app.use(errorMiddleware);

export default app;
