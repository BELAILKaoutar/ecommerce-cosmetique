
import multer from "multer";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const uploadDir = path.resolve("uploads/products");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");

export function uploadProductImage(req, res, next) {
  upload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "L'image ne doit pas dépasser 5 Mo."
            : "Impossible de recevoir l'image.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Aucune image sélectionnée.",
      });
    }

    try {
      const metadata = await sharp(req.file.buffer).metadata();

      if (!["jpeg", "png", "webp"].includes(metadata.format)) {
        return res.status(400).json({
          message: "Seules les images JPG, PNG et WebP sont acceptées.",
        });
      }

      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${crypto.randomUUID()}.webp`;

      await sharp(req.file.buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(path.join(uploadDir, filename));

      req.productImageUrl = `/uploads/products/${filename}`;

      next();
    } catch {
      return res.status(400).json({
        message: "Le fichier sélectionné n'est pas une image valide.",
      });
    }
  });
}
