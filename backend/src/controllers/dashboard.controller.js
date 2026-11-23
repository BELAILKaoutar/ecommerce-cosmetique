import { dashboardService } from "../services/dashboard.service.js";

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const dashboardController = {
  getStats: asyncHandler(async (req, res) => {
    const stats = await dashboardService.getStats();
    return res.status(200).json(stats);
  }),
};
