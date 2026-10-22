
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import request from "supertest";
import bcrypt from "bcryptjs";

import prisma from "../src/config/prisma.js";
import app from "../src/app.js";

const suffix = Date.now().toString();
const adminEmail = `imane.admin.${suffix}@example.com`;
const adminPassword = "TestAdmin123!";

let adminId;
let adminToken;

const createdServiceIds = [];

async function createTestService(overrides = {}) {
  const service = await prisma.service.create({
    data: {
      name: `Service test ${suffix}`,
      description: "Service créé pour les tests automatisés",
      durationMinutes: 60,
      price: 150,
      isActive: true,
      ...overrides,
    },
  });

  createdServiceIds.push(service.id);
  return service;
}

before(async () => {
  process.env.JWT_SECRET ||= "test-jwt-secret-services";

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      name: "Admin Test Services",
      passwordHash: await bcrypt.hash(adminPassword, 4),
    },
  });

  adminId = admin.id;

  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: adminEmail,
      password: adminPassword,
    });

  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  adminToken = login.body.token;
});

after(async () => {
  try {
    if (createdServiceIds.length > 0) {
      await prisma.service.deleteMany({
        where: {
          id: { in: createdServiceIds },
        },
      });
    }

    if (adminId) {
      await prisma.admin.delete({
        where: { id: adminId },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});

// 1. Consultation publique
test("GET /api/services : consultation publique autorisée", async () => {
  const response = await request(app).get("/api/services");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

// 2. Protection administrateur
test("GET /api/admin/services : accès refusé sans JWT", async () => {
  const response = await request(app).get("/api/admin/services");

  assert.equal(response.status, 401);
});

// 3. Consultation administrateur
test("GET /api/admin/services : accès autorisé avec JWT", async () => {
  const response = await request(app)
    .get("/api/admin/services")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

// 4. Création
test("POST /api/admin/services : créer un service", async () => {
  const response = await request(app)
    .post("/api/admin/services")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: `Soin visage test ${suffix}`,
      description: "Service créé par les tests automatisés",
      durationMinutes: 60,
      price: 150,
      isActive: true,
    });

  assert.equal(response.status, 201);
  assert.ok(response.body.id);
  assert.equal(response.body.name, `Soin visage test ${suffix}`);
  assert.equal(response.body.durationMinutes, 60);
  assert.equal(Number(response.body.price), 150);

  createdServiceIds.push(response.body.id);
});

// 5. Consultation par identifiant
test("GET /api/services/:id : consulter un service actif", async () => {
  const service = await createTestService();

  const response = await request(app)
    .get(`/api/services/${service.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, service.id);
});

// 6. Modification
test("PUT /api/admin/services/:id : modifier un service", async () => {
  const service = await createTestService();

  const response = await request(app)
    .put(`/api/admin/services/${service.id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Service modifié",
      durationMinutes: 45,
      price: 180,
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.name, "Service modifié");
  assert.equal(response.body.durationMinutes, 45);
  assert.equal(Number(response.body.price), 180);
});

// 7. Désactivation
test("PUT : un service désactivé disparaît du catalogue public", async () => {
  const service = await createTestService();

  const update = await request(app)
    .put(`/api/admin/services/${service.id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ isActive: false });

  assert.equal(update.status, 200);
  assert.equal(update.body.isActive, false);

  const publicResponse = await request(app).get("/api/services");

  assert.equal(publicResponse.status, 200);
  assert.equal(
    publicResponse.body.some((item) => item.id === service.id),
    false
  );

  const adminResponse = await request(app)
    .get(`/api/admin/services/${service.id}`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(adminResponse.status, 200);
  assert.equal(adminResponse.body.isActive, false);
});

// 8. Suppression
test("DELETE /api/admin/services/:id : supprimer un service", async () => {
  const service = await createTestService();

  const deleted = await request(app)
    .delete(`/api/admin/services/${service.id}`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(deleted.status, 204);

  const response = await request(app)
    .get(`/api/admin/services/${service.id}`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 404);
});

// 9. Refus de création sans authentification
test("POST /api/admin/services : refuser sans JWT", async () => {
  const response = await request(app)
    .post("/api/admin/services")
    .send({
      name: "Service non autorisé",
      price: 100,
    });

  assert.equal(response.status, 401);
});

// 10. Validation du nom
test("POST /api/admin/services : refuser un nom vide", async () => {
  const response = await request(app)
    .post("/api/admin/services")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "",
      price: 100,
    });

  assert.equal(response.status, 400);
});

// 11. Validation du prix
test("POST /api/admin/services : refuser un prix négatif", async () => {
  const response = await request(app)
    .post("/api/admin/services")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Service invalide",
      price: -50,
    });

  assert.equal(response.status, 400);
});

// 12. Validation de l'identifiant
test("GET /api/services/:id : refuser un identifiant invalide", async () => {
  const response = await request(app)
    .get("/api/services/identifiant-invalide");

  assert.equal(response.status, 400);
});
