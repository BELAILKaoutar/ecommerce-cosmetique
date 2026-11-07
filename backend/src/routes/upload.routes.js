
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadProductImage } from "../middlewares/product-upload.middleware.js";

const router = Router();

router.post(
  "/products",
  authMiddleware,
  uploadProductImage,
  (req, res) => {
    return res.status(201).json({
      imageUrl: req.productImageUrl,
    });
  }
);

export default router;
