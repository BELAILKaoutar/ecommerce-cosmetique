import jwt from "jsonwebtoken";
import { adminRepository } from "../repositories/admin.repository.js";

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }

  try {
    const payload = jwt.verify(token, secret);
    const admin = await adminRepository.findById(payload.sub);

    if (!admin) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
