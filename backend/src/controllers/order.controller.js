import { orderService } from "../services/order.service.js";

export const orderController = {
  async create(req, res, next) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const orders = await orderService.listOrders(req.query);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  },

  async confirm(req, res, next) {
    try {
      const order = await orderService.confirmOrder(req.params.id);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  async cancel(req, res, next) {
    try {
      const order = await orderService.cancelOrder(req.params.id);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const order = await orderService.updateStatus(
        req.params.id,
        req.body?.status
      );
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },
};
