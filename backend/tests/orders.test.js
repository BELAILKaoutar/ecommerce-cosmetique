import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import request from "supertest";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";
import app from "../src/app.js";

const suffix = Date.now().toString();
const adminEmail = `nouhaila.admin.${suffix}@example.com`;
const adminPassword = "Admin123!";
let adminToken;
let categoryId;
const createdOrderIds = [];
const createdProductIds = [];

async function loginAdmin() {
  const response = await request(app).post("/api/auth/login").send({
    email: adminEmail,
    password: adminPassword,
  });
  assert.equal(response.status, 200);
  return response.body.token;
}

async function createOwnedProduct({ name, price, stock }) {
  const product = await prisma.product.create({
    data: {
      name,
      price,
      stock,
      isActive: true,
      categoryId,
    },
  });
  createdProductIds.push(product.id);
  return product;
}

async function createGuestOrder(overrides = {}) {
  const payload = {
    customerName: "Sara Guest",
    customerEmail: `sara.${suffix}@example.com`,
    customerPhone: "0600000000",
    address: "12 rue des Roses",
    city: "Marrakech",
    items: [],
    unitPrice: 1,
    total: 9999,
    ...overrides,
  };

  const response = await request(app).post("/api/orders").send(payload);
  if (response.status === 201) {
    createdOrderIds.push(response.body.id);
  }
  return response;
}

before(async () => {
  process.env.JWT_SECRET ||= "test-jwt-secret-nouhaila";

  await prisma.admin.create({
    data: {
      email: adminEmail,
      name: "Nouhaila Test",
      passwordHash: await bcrypt.hash(adminPassword, 4),
    },
  });

  const category = await prisma.category.create({
    data: {
      name: `Catégorie test ${suffix}`,
      description: "Données de test commandes",
    },
  });
  categoryId = category.id;

  adminToken = await loginAdmin();
});

after(async () => {
  if (createdOrderIds.length) {
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: createdOrderIds } },
    });
    await prisma.order.deleteMany({
      where: { id: { in: createdOrderIds } },
    });
  }

  if (createdProductIds.length) {
    await prisma.product.deleteMany({
      where: { id: { in: createdProductIds } },
    });
  }

  if (categoryId) {
    await prisma.category.deleteMany({ where: { id: categoryId } });
  }

  await prisma.admin.deleteMany({ where: { email: adminEmail } });
  await prisma.$disconnect();
});

test("refuse un login admin invalide", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: adminEmail,
    password: "wrong-password",
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Identifiants invalides");
});

test("protège la liste admin des commandes", async () => {
  const response = await request(app).get("/api/admin/orders");
  assert.equal(response.status, 401);
});

test("crée une commande invitée avec des prix calculés côté serveur", async () => {
  const productA = await createOwnedProduct({
    name: `Sérum calcul ${suffix}`,
    price: 100,
    stock: 10,
  });
  const productB = await createOwnedProduct({
    name: `Crème calcul ${suffix}`,
    price: 50,
    stock: 5,
  });

  const response = await createGuestOrder({
    items: [
      { productId: productA.id, quantity: 2 },
      { productId: productB.id, quantity: 1 },
    ],
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.subtotal, 250);
  assert.equal(response.body.deliveryFee, 20);
  assert.equal(response.body.total, 270);
  assert.equal(response.body.status, "PENDING");
  assert.equal(response.body.stockDeducted, false);
  assert.match(response.body.orderNumber, /^CMD-\d{8}-[A-F0-9]{6}$/);
  assert.equal(response.body.confirmedAt, null);

  const stockA = await prisma.product.findUnique({ where: { id: productA.id } });
  assert.equal(stockA.stock, 10);
});

test("applique 35 DH hors Marrakech", async () => {
  const product = await createOwnedProduct({
    name: `Crème livraison ${suffix}`,
    price: 50,
    stock: 5,
  });

  const response = await createGuestOrder({
    city: "Casablanca",
    items: [{ productId: product.id, quantity: 1 }],
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.deliveryFee, 35);
  assert.equal(response.body.subtotal, 50);
  assert.equal(response.body.total, 85);
});

test("déduit le stock une seule fois à la confirmation", async () => {
  const initialStock = 10;
  const quantity = 3;
  const product = await createOwnedProduct({
    name: `Sérum confirmation ${suffix}`,
    price: 100,
    stock: initialStock,
  });

  const created = await createGuestOrder({
    items: [{ productId: product.id, quantity }],
  });
  assert.equal(created.status, 201);

  const confirmed = await request(app)
    .post(`/api/admin/orders/${created.body.id}/confirm`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(confirmed.status, 200);
  assert.equal(confirmed.body.status, "CONFIRMED");
  assert.equal(confirmed.body.stockDeducted, true);
  assert.ok(confirmed.body.confirmedAt);

  const afterConfirm = await prisma.product.findUnique({
    where: { id: product.id },
  });
  assert.equal(afterConfirm.stock, initialStock - quantity);

  const secondConfirm = await request(app)
    .post(`/api/admin/orders/${created.body.id}/confirm`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(secondConfirm.status, 409);

  const afterSecond = await prisma.product.findUnique({
    where: { id: product.id },
  });
  assert.equal(afterSecond.stock, initialStock - quantity);
});

test("restaure le stock une seule fois à l'annulation d'une commande confirmée", async () => {
  const initialStock = 5;
  const quantity = 2;
  const product = await createOwnedProduct({
    name: `Crème restauration ${suffix}`,
    price: 50,
    stock: initialStock,
  });

  const created = await createGuestOrder({
    items: [{ productId: product.id, quantity }],
  });
  assert.equal(created.status, 201);

  const confirmed = await request(app)
    .post(`/api/admin/orders/${created.body.id}/confirm`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(confirmed.status, 200);

  const afterConfirm = await prisma.product.findUnique({
    where: { id: product.id },
  });
  assert.equal(afterConfirm.stock, initialStock - quantity);

  const cancelled = await request(app)
    .post(`/api/admin/orders/${created.body.id}/cancel`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.status, "CANCELLED");
  assert.equal(cancelled.body.stockDeducted, false);

  const afterCancel = await prisma.product.findUnique({
    where: { id: product.id },
  });
  assert.equal(afterCancel.stock, initialStock);

  const secondCancel = await request(app)
    .post(`/api/admin/orders/${created.body.id}/cancel`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(secondCancel.status, 409);

  const afterSecondCancel = await prisma.product.findUnique({
    where: { id: product.id },
  });
  assert.equal(afterSecondCancel.stock, initialStock);
});

test("n'annule pas le stock d'une commande encore en attente", async () => {
  const initialStock = 10;
  const product = await createOwnedProduct({
    name: `Sérum pending ${suffix}`,
    price: 100,
    stock: initialStock,
  });

  const created = await createGuestOrder({
    items: [{ productId: product.id, quantity: 1 }],
  });
  assert.equal(created.status, 201);

  const cancelled = await request(app)
    .post(`/api/admin/orders/${created.body.id}/cancel`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(cancelled.status, 200);
  const after = await prisma.product.findUnique({ where: { id: product.id } });
  assert.equal(after.stock, initialStock);
});

test("refuse la confirmation si le stock est insuffisant", async () => {
  const product = await createOwnedProduct({
    name: `Crème insuffisant ${suffix}`,
    price: 50,
    stock: 5,
  });

  const created = await createGuestOrder({
    items: [{ productId: product.id, quantity: 5 }],
  });
  assert.equal(created.status, 201);

  await prisma.product.update({
    where: { id: product.id },
    data: { stock: 1 },
  });

  const confirmed = await request(app)
    .post(`/api/admin/orders/${created.body.id}/confirm`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(confirmed.status, 409);

  const afterConfirm = await prisma.product.findUnique({
    where: { id: product.id },
  });
  assert.equal(afterConfirm.stock, 1);
  const order = await prisma.order.findUnique({ where: { id: created.body.id } });
  assert.equal(order.status, "PENDING");
  assert.equal(order.stockDeducted, false);
});

test("n'effectue pas de nouvelle déduction lors du passage à SHIPPED", async () => {
  const initialStock = 8;
  const quantity = 2;
  const product = await createOwnedProduct({
    name: `Sérum expédition ${suffix}`,
    price: 80,
    stock: initialStock,
  });

  const created = await createGuestOrder({
    items: [{ productId: product.id, quantity }],
  });
  assert.equal(created.status, 201);

  const confirmed = await request(app)
    .post(`/api/admin/orders/${created.body.id}/confirm`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(confirmed.status, 200);

  const shipped = await request(app)
    .patch(`/api/admin/orders/${created.body.id}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "SHIPPED" });

  assert.equal(shipped.status, 200);
  assert.equal(shipped.body.status, "SHIPPED");

  const afterShip = await prisma.product.findUnique({ where: { id: product.id } });
  assert.equal(afterShip.stock, initialStock - quantity);
});
