
import client from "./client";

// GET /api/stock
export async function getStocks() {
  const response = await client.get("/api/stock");
  return response.data;
}

// PATCH /api/stock/:id/restock
export async function restockProduct(productId, quantity) {
  const response = await client.patch(
    `/api/stock/${productId}/restock`,
    { quantity }
  );

  return response.data;
}

// PATCH /api/stock/:id/adjust
export async function adjustProductStock(productId, quantity) {
  const response = await client.patch(
    `/api/stock/${productId}/adjust`,
    { quantity }
  );

  return response.data;
}
