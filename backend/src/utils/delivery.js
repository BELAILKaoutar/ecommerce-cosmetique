const MARRAKECH_FEE = 20;
const OTHER_CITY_FEE = 35;

function normalizeCity(city) {
  return city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function getDeliveryFee(city) {
  if (typeof city !== "string" || !city.trim()) {
    return OTHER_CITY_FEE;
  }

  return normalizeCity(city) === "marrakech" ? MARRAKECH_FEE : OTHER_CITY_FEE;
}

export { MARRAKECH_FEE, OTHER_CITY_FEE };
