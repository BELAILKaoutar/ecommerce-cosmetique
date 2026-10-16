import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminRepository } from "../repositories/admin.repository.js";
import { AppError } from "../utils/app-error.js";

const TOKEN_TTL = process.env.JWT_EXPIRES_IN || "8h";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET est manquant dans le fichier .env");
  }
  return secret;
}

function toPublicAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };
}

export const authService = {
  async login(email, password) {
    if (typeof email !== "string" || !email.trim() || typeof password !== "string") {
      throw new AppError("Identifiants invalides", 401);
    }

    const admin = await adminRepository.findByEmail(email.trim().toLowerCase());

    if (!admin) {
      throw new AppError("Identifiants invalides", 401);
    }

    const matches = await bcrypt.compare(password, admin.passwordHash);

    if (!matches) {
      throw new AppError("Identifiants invalides", 401);
    }

    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      getJwtSecret(),
      { expiresIn: TOKEN_TTL }
    );

    return {
      token,
      admin: toPublicAdmin(admin),
    };
  },

  async getCurrentAdmin(id) {
    const admin = await adminRepository.findById(id);

    if (!admin) {
      throw new AppError("Administrateur introuvable", 401);
    }

    return toPublicAdmin(admin);
  },
};
