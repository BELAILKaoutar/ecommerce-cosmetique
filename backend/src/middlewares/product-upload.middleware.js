import multer from "multer";
import sharp from "sharp";
import crypto from "node:crypto";
import cloudinary from "../config/cloudinary.js";

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

    let imageBuffer;

    try {
      const metadata = await sharp(req.file.buffer).metadata();

      if (!["jpeg", "png", "webp"].includes(metadata.format)) {
        return res.status(400).json({
          message: "Seules les images JPG, PNG et WebP sont acceptées.",
        });
      }

      imageBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      return res.status(400).json({
        message: "Le fichier sélectionné n'est pas une image valide.",
      });
    }

    try {
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        throw new Error("Configuration Cloudinary manquante");
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "by-wijo/products",
            public_id: crypto.randomUUID(),
            resource_type: "image",
            format: "webp",
          },
          (uploadError, uploadedImage) => {
            if (uploadError) return reject(uploadError);
            resolve(uploadedImage);
          }
        );

        stream.end(imageBuffer);
      });

      req.productImageUrl = result.secure_url;
      next();
    } catch (uploadError) {
      console.error("Échec de l'upload Cloudinary :", uploadError.message);

      return res.status(500).json({
        message: "Impossible d'enregistrer l'image pour le moment.",
      });
    }
  });
}