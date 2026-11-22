import { authService } from "../services/auth.service.js";

export const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body?.email, req.body?.password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const admin = await authService.getCurrentAdmin(req.admin.id);
      res.status(200).json(admin);
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    // Avec JWT stateless, le logout est géré côté client (suppression du token).
    // Côté serveur on confirme la déconnexion et on peut effacer un éventuel cookie.
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ message: "Déconnexion réussie" });
  },
};
