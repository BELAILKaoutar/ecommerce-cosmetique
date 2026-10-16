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
};
