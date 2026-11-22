export const LOGO_SRC = "/images/by-wijo-logo.png.jpeg";

// ─── Informations officielles By Wijo ───────────────────────────────────────
export const SITE = {
  name: "By Wijo – Love Your Body",
  nameShort: "BY WIJO",
  slogan: "Love Your Body",
  whatsapp: import.meta.env.VITE_WHATSAPP?.trim() || "212699958101",
  whatsappDisplay: import.meta.env.VITE_WHATSAPP_DISPLAY?.trim() || "0699 958 101",
  instagram: import.meta.env.VITE_INSTAGRAM?.trim() || "by_wijo_love_your_body",
  instagramUrl: "https://www.instagram.com/by_wijo_love_your_body/",
  tiktok: import.meta.env.VITE_TIKTOK?.trim() || "by wijo love your body",
  phone: import.meta.env.VITE_PHONE?.trim() || "0699958101",
  email: import.meta.env.VITE_EMAIL?.trim() || "",
  address: import.meta.env.VITE_ADDRESS?.trim() || "Iziki, à côté de Derb Belmrikhi, Marrakech, Maroc",
  city: "Marrakech, Maroc",
};

// ─── Lien WhatsApp universel ─────────────────────────────────────────────────
export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp}`;

// ─── Services By Wijo (noms officiels en arabe) ──────────────────────────────
export const BYWIJO_SERVICES = [
  {
    id: "kadira",
    nameAr: "الكديرة العصرية",
    nameFr: "Le Bain Traditionnel Moderne",
    emoji: "🌸",
    description: "Un soin corporel complet inspiré du hammam traditionnel marocain, revisité avec des soins naturels premium.",
  },
  {
    id: "hijama",
    nameAr: "الحجامة بأنواعها",
    nameFr: "Hijama (Cupping Thérapeutique)",
    emoji: "🌿",
    description: "La Hijama selon la Sunna, pratiquée avec précision et hygiène. Différents types adaptés à vos besoins.",
  },
  {
    id: "massage",
    nameAr: "المساج العلاجي",
    nameFr: "Massage Thérapeutique",
    emoji: "✨",
    description: "Massages ciblés pour soulager les tensions musculaires, stimuler la circulation et favoriser la détente profonde.",
  },
  {
    id: "fouta",
    nameAr: "الفوطة النارية",
    nameFr: "Fouta Ignée (Soin Chaud)",
    emoji: "🔥",
    description: "Un soin thermique traditionnel marocain aux vertus relaxantes et décontractantes, idéal pour le dos et les articulations.",
  },
  {
    id: "jibs",
    nameAr: "التخصيص بالجبص",
    nameFr: "Modélage au Plâtre",
    emoji: "💎",
    description: "Technique de soin esthétique traditionnelle à base de plâtre naturel pour raffermir et embellir la peau.",
  },
  {
    id: "domicile",
    nameAr: "خدمة منزلية متوفرة",
    nameFr: "Service à Domicile",
    emoji: "🏠",
    description: "Tous nos soins peuvent être réalisés à domicile, pour plus de confort et d'intimité. Disponible sur Marrakech.",
  },
];

// ─── Citation hadith ─────────────────────────────────────────────────────────
export const HIJAMA_QUOTE = "خير ما تداويتم بالحجامة";
export const HIJAMA_QUOTE_SOURCE = "حديث شريف";

export const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/boutique", label: "Boutique" },
  { to: "/soins", label: "Nos Soins" },
  { to: "/reservation-hijama", label: "Réservation Hijama" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];
