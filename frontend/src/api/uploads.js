
import client from "./client";

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await client.post(
    "/api/uploads/products",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data.imageUrl;
}
