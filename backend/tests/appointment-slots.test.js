
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

const api = request(app);

const addMinutes = (date, minutes) =>
  new Date(date.getTime() + minutes * 60_000);

test("EH-54 - Gestion des créneaux", async (t) => {
  let serviceId;
  let slotId;
  let token;

  const startAt = new Date();
  startAt.setUTCDate(startAt.getUTCDate() + 30);
  startAt.setUTCHours(10, 0, 0, 0);

  const updatedStartAt = addMinutes(startAt, 120);

  try {
    // Service temporaire réservé aux tests
    const service = await prisma.service.create({
      data: {
        name: `Service test EH-54 ${Date.now()}`,
        description: "Service temporaire pour les tests",
        durationMinutes: 75,
        price: 180,
        isActive: true,
      },
    });

    serviceId = service.id;

    // Authentification réelle de l'administrateur
    assert.ok(
      process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD,
      "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env"
    );

    const loginResponse = await api
      .post("/api/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });

    assert.equal(
      loginResponse.status,
      200,
      `Connexion admin échouée : ${JSON.stringify(loginResponse.body)}`
    );

    token = loginResponse.body.token ??
      loginResponse.body.accessToken ??
      loginResponse.body.data?.token ??
      loginResponse.body.data?.accessToken;

    assert.ok(token, "Token JWT absent de la réponse de connexion.");

    await t.test("Refuser l'accès administrateur sans JWT", async () => {
      const response = await api.get(
        "/api/admin/appointment-slots"
      );

      assert.equal(response.status, 401);
    });

    await t.test("Créer un créneau avec calcul automatique", async () => {
      const response = await api
        .post("/api/admin/appointment-slots")
        .set("Authorization", `Bearer ${token}`)
        .send({
          serviceId,
          startAt: startAt.toISOString(),
        });

      assert.equal(
        response.status,
        201,
        JSON.stringify(response.body)
      );

      slotId = response.body.id;

      assert.ok(slotId);
      assert.equal(response.body.serviceId, serviceId);
      assert.equal(response.body.capacity, 1);
      assert.equal(response.body.isActive, true);

      const duration =
        (new Date(response.body.endAt) -
          new Date(response.body.startAt)) /
        60_000;

      assert.equal(duration, 75);
    });

    await t.test("Afficher le créneau dans la liste publique", async () => {
      const response = await api.get(
        `/api/appointment-slots?serviceId=${serviceId}`
      );

      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body));
      assert.ok(
        response.body.some((slot) => slot.id === slotId)
      );
    });

    await t.test("Refuser un créneau qui se chevauche", async () => {
      const overlappingStart = addMinutes(startAt, 30);

      const response = await api
        .post("/api/admin/appointment-slots")
        .set("Authorization", `Bearer ${token}`)
        .send({
          serviceId,
          startAt: overlappingStart.toISOString(),
        });

      assert.equal(response.status, 409);
    });

    await t.test("Refuser une capacité supérieure à 1", async () => {
      const response = await api
        .post("/api/admin/appointment-slots")
        .set("Authorization", `Bearer ${token}`)
        .send({
          serviceId,
          startAt: addMinutes(startAt, 240).toISOString(),
          capacity: 2,
        });

      assert.equal(response.status, 400);
    });

    await t.test("Refuser une date de début passée", async () => {
      const pastDate = new Date();
      pastDate.setUTCDate(pastDate.getUTCDate() - 1);

      const response = await api
        .post("/api/admin/appointment-slots")
        .set("Authorization", `Bearer ${token}`)
        .send({
          serviceId,
          startAt: pastDate.toISOString(),
        });

      assert.equal(response.status, 400);
    });

    await t.test("Modifier le créneau et recalculer sa fin", async () => {
      const response = await api
        .put(`/api/admin/appointment-slots/${slotId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          startAt: updatedStartAt.toISOString(),
        });

      assert.equal(
        response.status,
        200,
        JSON.stringify(response.body)
      );

      assert.equal(
        new Date(response.body.startAt).getTime(),
        updatedStartAt.getTime()
      );

      const duration =
        (new Date(response.body.endAt) -
          new Date(response.body.startAt)) /
        60_000;

      assert.equal(duration, 75);
    });

    await t.test("Désactiver le créneau", async () => {
      const response = await api
        .delete(`/api/admin/appointment-slots/${slotId}`)
        .set("Authorization", `Bearer ${token}`);

      assert.equal(
        response.status,
        200,
        JSON.stringify(response.body)
      );

      assert.equal(response.body.slot.isActive, false);
    });

    await t.test("Masquer le créneau désactivé au public", async () => {
      const response = await api.get(
        `/api/appointment-slots?serviceId=${serviceId}`
      );

      assert.equal(response.status, 200);

      assert.ok(
        !response.body.some((slot) => slot.id === slotId)
      );
    });

    await t.test("Conserver le créneau désactivé en base", async () => {
      const slot = await prisma.appointmentSlot.findUnique({
        where: { id: slotId },
      });

      assert.ok(slot);
      assert.equal(slot.isActive, false);
    });
  } finally {
    // Nettoyage limité aux données créées par ce test
    if (serviceId) {
      await prisma.appointmentSlot.deleteMany({
        where: { serviceId },
      });

      await prisma.service.delete({
        where: { id: serviceId },
      });
    }
  }
});
