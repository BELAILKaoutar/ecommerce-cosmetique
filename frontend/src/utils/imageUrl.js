
const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  // Images externes ou prévisualisations locales
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  // Images uploadées sur le backend
  if (imageUrl.startsWith("/uploads/")) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  // Compatibilité avec les anciennes images publiques
  return imageUrl;
}
