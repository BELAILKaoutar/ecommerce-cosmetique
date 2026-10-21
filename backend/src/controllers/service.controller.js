
import { serviceService } from "../services/service.service.js";

export const serviceController = {
  // GET /api/services
  async getActive(req, res, next) {
    try {
      const services = await serviceService.getActiveServices();
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/services/:id
  async getById(req, res, next) {
    try {
      const service = await serviceService.getServiceById(
        req.params.id,
        true
      );
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/services
  async getAllAdmin(req, res, next) {
    try {
      const services = await serviceService.getAllServices();
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/services/:id
  async getByIdAdmin(req, res, next) {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/admin/services
  async create(req, res, next) {
    try {
      const service = await serviceService.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/admin/services/:id
  async update(req, res, next) {
    try {
      const service = await serviceService.updateService(
        req.params.id,
        req.body
      );
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/admin/services/:id
  async remove(req, res, next) {
    try {
      await serviceService.deleteService(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
