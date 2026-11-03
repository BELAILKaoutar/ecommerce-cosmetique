export const LOGO_SRC = "/images/by-wijo-logo.png.jpeg";

export const SITE = {
  name: "BY WIJO",
  slogan: "Love Your Body",
  whatsapp: import.meta.env.VITE_WHATSAPP?.trim() || "",
  instagram: import.meta.env.VITE_INSTAGRAM?.trim() || "",
  phone: import.meta.env.VITE_PHONE?.trim() || "",
  email: import.meta.env.VITE_EMAIL?.trim() || "",
  address: import.meta.env.VITE_ADDRESS?.trim() || "",
};

export const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/boutique", label: "Boutique" },
  { to: "/soins", label: "Nos Soins" },
  { to: "/reservation-hijama", label: "Réservation Hijama" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];
