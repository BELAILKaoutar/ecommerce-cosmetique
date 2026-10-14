
import { productService } from "../services/product.service.js";

export const productController = {
  // GET /api/products
  async getAll(req, res, next) {
    try {
      const products = await productService.getAllProducts(req.query);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/products/:id
  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/products
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/products/:id
  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body
      );
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/products/:id
  async remove(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
