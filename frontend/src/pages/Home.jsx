import { Link } from "react-router-dom";
import {
  MessageCircle,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";
import {
  SITE,
  LOGO_SRC,
  BYWIJO_SERVICES,
  HIJAMA_QUOTE,
  HIJAMA_QUOTE_SOURCE,
  WHATSAPP_URL,
} from "../config/site";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildWhatsAppUrl(message = "") {
  const encoded = encodeURIComponent(message);
  return `${WHATSAPP_URL}?text=${encoded}`;
}

const QUICK_WA_MSG = `Bonjour By Wijo – Love Your Body 🌸

Je souhaite obtenir des informations sur vos soins et tarifs.

Merci !`;

export default function Home() {
  const waUrl = buildWhatsAppUrl(QUICK_WA_MSG);

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-dark to-[#1e3328] text-ivory">
        {/* Décoration de fond */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-sage/15 blur-3xl" />

        <PageContainer className="relative z-10 py-20 sm:py-28 md:py-36">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* Texte */}
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
                <Sparkles size={13} />
                By Wijo – Love Your Body
              </span>

              <h1 className="mt-6 font-heading text-4xl leading-tight text-ivory sm:text-5xl lg:text-6xl">
                La beauté naturelle{" "}
                <span className="text-gold">commence</span> par vous.
              </h1>

              <p className="mt-5 text-base leading-relaxed text-ivory/80 sm:text-lg">
                Découvrez nos soins naturels, Hijama, massages et rituels
                de beauté traditionnels. Un moment rien que pour vous, au
                centre ou à domicile à Marrakech.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <Button to="/reservation-hijama" size="lg">
                  <Heart size={18} />
                  Réserver une séance
                </Button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ivory/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-ivory backdrop-blur-sm transition hover:bg-white/20"
                >
                  <MessageCircle size={18} />
                  Nous écrire sur WhatsApp
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-ivory/60 md:justify-start">
                <span className="flex items-center gap-1.5">
                  <Star size={13} className="text-gold" fill="currentColor" />
                  Soins naturels premium
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gold" />
                  Marrakech &amp; Domicile
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart size={13} className="text-gold" fill="currentColor" />
                  Réservation rapide
                </span>
              </div>
            </div>

            {/* Logo / Illustration */}
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gold/20 blur-2xl" />
                <img
                  src={LOGO_SRC}
                  alt="By Wijo – Love Your Body"
                  className="relative h-56 w-56 rounded-3xl object-contain bg-ivory/10 p-6 shadow-2xl sm:h-72 sm:w-72"
                />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ═══════════════════════════════════════════════
          CITATION HADITH
      ═══════════════════════════════════════════════ */}
      <section className="bg-gold/20 border-y border-gold/40 py-10 px-5">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="font-heading text-3xl sm:text-4xl text-forest leading-relaxed"
            dir="rtl"
            lang="ar"
          >
            « {HIJAMA_QUOTE} »
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted">
            {HIJAMA_QUOTE_SOURCE}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SERVICES — CARDS
      ═══════════════════════════════════════════════ */}
      <section className="py-20 bg-cream">
        <PageContainer>
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-sage">
              Nos Prestations
            </span>
            <h2 className="mt-3 font-heading text-4xl text-forest">
              Nos soins &amp; services
            </h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">
              Des soins traditionnels marocains et thérapeutiques, disponibles au centre ou à domicile à Marrakech.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BYWIJO_SERVICES.map((service) => (
              <div
                key={service.id}
                className="group rounded-3xl border border-gold/40 bg-ivory p-6 shadow-xs transition hover:border-forest/60 hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/10 text-3xl">
                  {service.emoji}
                </div>

                <p
                  className="font-heading text-2xl text-forest leading-snug"
                  dir="rtl"
                  lang="ar"
                >
                  {service.nameAr}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted uppercase tracking-wide">
                  {service.nameFr}
                </p>
                <p className="mt-3 text-sm text-charcoal/75 leading-relaxed">
                  {service.description}
                </p>

                <a
                  href={buildWhatsAppUrl(
                    `Bonjour By Wijo – Love Your Body 🌸\n\nJe souhaite des informations sur : ${service.nameFr} (${service.nameAr})\n\nMerci !`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline group-hover:gap-2.5 transition-all"
                >
                  <MessageCircle size={14} />
                  Renseignements via WhatsApp
                  <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button to="/soins" size="lg" variant="outline">
              Voir tous nos soins
              <ArrowRight size={18} />
            </Button>
          </div>
        </PageContainer>
      </section>

      {/* ═══════════════════════════════════════════════
          BANNIÈRE RÉSERVATION
      ═══════════════════════════════════════════════ */}
      <section className="bg-forest py-16">
        <PageContainer className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            <Heart size={13} />
            Réservez facilement
          </span>
          <h2 className="mt-5 font-heading text-3xl sm:text-4xl text-ivory">
            Prête pour votre soin ?
          </h2>
          <p className="mt-4 text-ivory/75 max-w-lg mx-auto">
            Remplissez notre formulaire de réservation en ligne et nous vous confirmons votre créneau directement sur WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button to="/reservation-hijama" size="lg">
              <Heart size={18} />
              Réserver maintenant
            </Button>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ivory/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-ivory transition hover:bg-white/20"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </PageContainer>
      </section>

      {/* ═══════════════════════════════════════════════
          INFOS RAPIDES : Localisation + Réseaux
      ═══════════════════════════════════════════════ */}
      <section className="py-16 bg-ivory">
        <PageContainer>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Adresse */}
            <div className="rounded-3xl border border-gold/40 bg-cream p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10">
                <MapPin size={22} className="text-forest" />
              </div>
              <h3 className="font-heading text-lg text-forest">Localisation</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {SITE.address}
              </p>
            </div>

            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-gold/40 bg-cream p-6 text-center transition hover:border-forest/50 hover:bg-forest/5 group"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/15 group-hover:bg-[#25D366]/25 transition">
                <MessageCircle size={22} className="text-[#25D366]" />
              </div>
              <h3 className="font-heading text-lg text-forest">WhatsApp</h3>
              <p className="mt-2 text-sm text-muted">{SITE.whatsappDisplay}</p>
              <p className="mt-1 text-xs font-semibold text-[#25D366]">
                Écrire maintenant →
              </p>
            </a>

            {/* Instagram */}
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-gold/40 bg-cream p-6 text-center transition hover:border-pink-300 hover:bg-pink-50/50 group"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 group-hover:bg-pink-200 transition">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-pink-600" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg text-forest">Instagram</h3>
              <p className="mt-2 text-sm text-muted">@{SITE.instagram}</p>
              <p className="mt-1 text-xs font-semibold text-pink-500">
                Nous suivre →
              </p>
            </a>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
