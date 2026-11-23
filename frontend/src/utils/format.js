export function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `${amount.toFixed(2).replace(".", ",")} DH`;
}

export function getApiErrorMessage(error) {
  return (
    error?.message ||
    error?.data?.message ||
    "Une erreur est survenue. Veuillez réessayer."
  );
}
