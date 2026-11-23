
import { stockService } from "../services/stock.service.js";

export const stockController = {
  async getAll(req, res, next) {
    try {
      const stocks = await stockService.getAllStocks();
      res.status(200).json(stocks);
    } catch (error) {
      next(error);
    }
  },

  async restock(req, res, next) {
    try {
      const product = await stockService.restock(
        req.params.id,
        req.body?.quantity
      );

      res.status(200).json({
        message: "Stock réapprovisionné avec succès",
        product,
      });
    } catch (error) {
      next(error);
    }
  },

  async adjust(req, res, next) {
    try {
      const product = await stockService.adjustStock(
        req.params.id,
        req.body?.quantity
      );

      res.status(200).json({
        message: "Stock ajusté avec succès",
        product,
      });
    } catch (error) {
      next(error);
    }
  },
};
