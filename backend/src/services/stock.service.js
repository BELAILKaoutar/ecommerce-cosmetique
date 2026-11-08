
import { productService } from "./product.service.js";
import { stockRepository } from "../repositories/stock.repository.js";

class StockError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "StockError";
    this.statusCode = statusCode;
  }
}

function validateQuantity(quantity, allowZero = false) {
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < (allowZero ? 0 : 1)
  ) {
    throw new StockError(
      allowZero
        ? "La quantité doit être un entier positif ou nul"
        : "La quantité doit être un entier strictement positif"
    );
  }
}

export const stockService = {
  // Consulter les stocks
  async getAllStocks() {
    return stockRepository.getAllStocks();
  },

  // Ajouter du stock
  async restock(productId, quantity) {
    validateQuantity(quantity);

    await productService.getProductById(productId);

    return stockRepository.increaseStock(productId, quantity);
  },

  // Corriger le stock après inventaire
  async adjustStock(productId, quantity) {
    validateQuantity(quantity, true);

    await productService.getProductById(productId);

    return stockRepository.setStock(productId, quantity);
  },
};
