
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

const api = request(app);

const customer = {
  customerName: "Sara El Amrani",
  phone: "0612345678",
};

test("EH-55 - Réservation de service sans compte", async (t) => {
  let serviceId;

  const slotIds = [];

  const startAt = new Date();
  startAt.setUTCDate(startAt.getUTCDate() + 45);
  startAt.setUTCHours(10, 0, 0, 0);

  async function createSlot({
    daysOffset = 0,
    isActive = true,
    past = false,
  } = {}) {
    const start = new Date(startAt);

    if (past) {
      start.setUTCDate(start.getUTCDate() - 60);
    } else {
      start.setUTCDate(start.getUTCDate() + daysOffset);
    }

    const end = new Date(start.getTime() + 75 * 60_000);

    const slot = await prisma.appointmentSlot.create({
      data: {
        serviceId,
        startAt: start,
        endAt: end,
        capacity: 1,
        isActive,
      },
    });

    slotIds.push(slot.id);
    return slot;
  }

  try {
    // Données temporaires propres à EH-55.
    const service = await prisma.service.create({
      data: {
        name: `Service test EH-55 ${Date.now()}`,
        description: "Service temporaire de réservation",
        durationMinutes: 75,
        price: 180,
        isActive: true,
      },
    });

    serviceId = service.id;

    const mainSlot = await createSlot();
    const freeSlot = await createSlot({ daysOffset: 1 });

    await t.test(
      "Afficher les créneaux disponibles avant réservation",
      async () => {
        const response = await api.get(
          `/api/appointments/available-slots/${serviceId}`
        );

        assert.equal(
          response.status,
          200,
          JSON.stringify(response.body)
        );

        assert.ok(Array.isArray(response.body));

        assert.ok(
          response.body.some((slot) => slot.id === mainSlot.id)
        );

        assert.ok(
          response.body.some((slot) => slot.id === freeSlot.id)
        );
      }
    );

    await t.test(
      "Créer une réservation sans token JWT",
      async () => {
        const response = await api
          .post("/api/appointments")
          .send({
            slotId: mainSlot.id,
            ...customer,
          });

        assert.equal(
          response.status,
          201,
          JSON.stringify(response.body)
        );

        assert.ok(response.body.id);
        assert.equal(response.body.status, "PENDING");
        assert.equal(
          response.body.customerName,
          customer.customerName
        );
        assert.equal(response.body.phone, customer.phone);
        assert.equal(response.body.slot.id, mainSlot.id);
        assert.equal(response.body.service.id, serviceId);

        const saved = await prisma.appointment.findUnique({
          where: { id: response.body.id },
        });

        assert.ok(saved);
        assert.equal(saved.status, "PENDING");
        assert.equal(saved.slotId, mainSlot.id);
      }
    );

    await t.test(
      "Refuser une deuxième réservation du même créneau",
      async () => {
        const response = await api
          .post("/api/appointments")
          .send({
            slotId: mainSlot.id,
            customerName: "Autre Cliente",
            phone: "0698765432",
          });

        assert.equal(
          response.status,
          409,
          JSON.stringify(response.body)
        );

        const count = await prisma.appointment.count({
          where: {
            slotId: mainSlot.id,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        });

        assert.equal(count, 1);
      }
    );

    await t.test(
      "Masquer le créneau réservé des disponibilités",
      async () => {
        const response = await api.get(
          `/api/appointments/available-slots/${serviceId}`
        );

        assert.equal(response.status, 200);

        assert.ok(
          !response.body.some(
            (slot) => slot.id === mainSlot.id
          )
        );

        assert.ok(
          response.body.some(
            (slot) => slot.id === freeSlot.id
          )
        );
      }
    );

    await t.test(
      "Refuser un identifiant de créneau invalide",
      async () => {
        const response = await api
          .post("/api/appointments")
          .send({
            slotId: "identifiant-invalide",
            ...customer,
          });

        assert.equal(response.status, 400);
      }
    );

    await t.test(
      "Refuser un créneau inexistant",
      async () => {
        const response = await api
          .post("/api/appointments")
          .send({
            slotId: "00000000-0000-4000-8000-000000000001",
            ...customer,
          });

        assert.equal(response.status, 404);
      }
    );

    await t.test(
      "Refuser un nom de cliente invalide",
      async () => {
        const response = await api
          .post("/api/appointments")
          .send({
            slotId: freeSlot.id,
            customerName: "A",
            phone: "0612345678",
          });

        assert.equal(response.status, 400);
      }
    );

    await t.test(
      "Refuser un numéro de téléphone invalide",
      async () => {
        const response = await api
          .post("/api/appointments")
          .send({
            slotId: freeSlot.id,
            customerName: "Sara El Amrani",
            phone: "abc",
          });

        assert.equal(response.status, 400);
      }
    );

    await t.test(
      "Refuser les champs non autorisés",
      async () => {
        const response = await api
          .post("/api/appointments")
          .send({
            slotId: freeSlot.id,
            ...customer,
            status: "CONFIRMED",
          });

        assert.equal(response.status, 400);
      }
    );

    await t.test(
      "Refuser la réservation d'un créneau passé",
      async () => {
        const pastSlot = await createSlot({ past: true });

        const response = await api
          .post("/api/appointments")
          .send({
            slotId: pastSlot.id,
            ...customer,
          });

        assert.equal(response.status, 409);
      }
    );

    await t.test(
      "Refuser un créneau désactivé",
      async () => {
        const inactiveSlot = await createSlot({
          daysOffset: 2,
          isActive: false,
        });

        const response = await api
          .post("/api/appointments")
          .send({
            slotId: inactiveSlot.id,
            ...customer,
          });

        assert.equal(response.status, 409);
      }
    );

    await t.test(
      "Autoriser une nouvelle réservation après annulation",
      async () => {
        const cancellableSlot = await createSlot({
          daysOffset: 3,
        });

        const first = await api
          .post("/api/appointments")
          .send({
            slotId: cancellableSlot.id,
            ...customer,
          });

        assert.equal(first.status, 201);

        // Simulation d'une annulation en base :
        // l'API d'annulation n'est pas encore développée.
        await prisma.appointment.update({
          where: { id: first.body.id },
          data: { status: "CANCELLED" },
        });

        const second = await api
          .post("/api/appointments")
          .send({
            slotId: cancellableSlot.id,
            customerName: "Nouvelle Cliente",
            phone: "0698765432",
          });

        assert.equal(
          second.status,
          201,
          JSON.stringify(second.body)
        );

        assert.equal(second.body.status, "PENDING");
      }
    );

    await t.test(
      "Empêcher deux réservations simultanées",
      async () => {
        const concurrentSlot = await createSlot({
          daysOffset: 4,
        });

        const [first, second] = await Promise.all([
          api.post("/api/appointments").send({
            slotId: concurrentSlot.id,
            customerName: "Cliente Un",
            phone: "0611111111",
          }),
          api.post("/api/appointments").send({
            slotId: concurrentSlot.id,
            customerName: "Cliente Deux",
            phone: "0622222222",
          }),
        ]);

        const statuses = [
          first.status,
          second.status,
        ].sort((a, b) => a - b);

        assert.deepEqual(
          statuses,
          [201, 409],
          `Réponses inattendues : ${JSON.stringify([
            first.body,
            second.body,
          ])}`
        );

        const count = await prisma.appointment.count({
          where: {
            slotId: concurrentSlot.id,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        });

        assert.equal(count, 1);
      }
    );

  } finally {
    // Nettoyer uniquement les données créées par EH-55.
    if (serviceId) {
      await prisma.appointment.deleteMany({
        where: {
          slotId: { in: slotIds },
        },
      });

      await prisma.appointmentSlot.deleteMany({
        where: { serviceId },
      });

      await prisma.service.delete({
        where: { id: serviceId },
      });
    }
  }
});
