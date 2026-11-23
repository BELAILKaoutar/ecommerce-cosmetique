import { Link } from "react-router-dom";
import { MessageCircle, MapPin } from "lucide-react";
import { SITE, WHATSAPP_URL, BYWIJO_SERVICES, HIJAMA_QUOTE } from "../config/site";

// SVG Instagram inline
function InstagramIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// SVG TikTok inline
function TikTokIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.17 8.17 0 004.78 1.52V6.9a4.85 4.85 0 01-1.01-.21z" />
    </svg>
  );
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-forest px-4 py-20 text-center text-ivory">
        <p className="mb-3 text-sm tracking-[0.3em] text-gold uppercase">By Wijo</p>
        <h1 className="font-heading text-5xl md:text-6xl">Contactez-nous</h1>
        <p className="mt-4 text-lg text-ivory/80">
          Nous sommes disponibles pour répondre à toutes vos questions
        </p>
        <p className="mt-1 text-sm text-sage">{SITE.name}</p>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Contact Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {/* WhatsApp Card */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center rounded-2xl border border-gold/30 bg-ivory p-8 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle size={32} />
            </div>
            <h2 className="font-heading text-2xl text-charcoal">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted">Nous écrire directement</p>
            <p className="mt-3 text-lg font-semibold text-forest">{SITE.whatsappDisplay}</p>
            <span
              className="mt-4 inline-block rounded-full px-6 py-2 text-sm font-medium text-white transition-opacity group-hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              Ouvrir WhatsApp
            </span>
          </a>

          {/* Instagram Card */}
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center rounded-2xl border border-gold/30 bg-ivory p-8 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
            >
              <InstagramIcon size={32} />
            </div>
            <h2 className="font-heading text-2xl text-charcoal">Instagram</h2>
            <p className="mt-2 text-sm text-muted">Suivez notre actualité</p>
            <p className="mt-3 text-lg font-semibold text-forest">@{SITE.instagram}</p>
            <span
              className="mt-4 inline-block rounded-full px-6 py-2 text-sm font-medium text-white transition-opacity group-hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)" }}
            >
              Voir le profil
            </span>
          </a>

          {/* TikTok Card */}
          <a
            href="https://www.tiktok.com/@bywijo"
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center rounded-2xl border border-gold/30 bg-ivory p-8 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg"
              style={{ backgroundColor: "#010101" }}
            >
              <TikTokIcon size={32} />
            </div>
            <h2 className="font-heading text-2xl text-charcoal">TikTok</h2>
            <p className="mt-2 text-sm text-muted">Nos vidéos & soins</p>
            <p className="mt-3 text-lg font-semibold text-forest">by wijo love your body</p>
            <span
              className="mt-4 inline-block rounded-full px-6 py-2 text-sm font-medium text-white transition-opacity group-hover:opacity-90"
              style={{ backgroundColor: "#010101" }}
            >
              Voir TikTok
            </span>
          </a>

          {/* Address Card */}
          <div className="flex flex-col items-center rounded-2xl border border-gold/30 bg-ivory p-8 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest text-gold shadow-lg">
              <MapPin size={32} />
            </div>
            <h2 className="font-heading text-2xl text-charcoal">Localisation</h2>
            <p className="mt-2 text-sm text-muted">Où nous trouver</p>
            <p className="mt-3 text-base text-charcoal leading-relaxed">{SITE.address}</p>
            <a
              href={`https://maps.google.com/?q=Iziki,Marrakech,Maroc`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block rounded-full border border-forest px-6 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-ivory"
            >
              Voir sur la carte
            </a>
          </div>
        </div>

        {/* Services Section */}
        <section className="mt-20">
          <h2 className="font-heading text-center text-4xl text-forest">Nos Prestations</h2>
          <p className="mt-2 text-center text-muted">Découvrez nos soins naturels à Marrakech</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BYWIJO_SERVICES.map((service) => (
              <div
                key={service.id}
                className="rounded-xl border border-gold/20 bg-ivory p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{service.emoji}</div>
                <p
                  className="text-right text-lg font-semibold text-charcoal"
                  dir="rtl"
                  lang="ar"
                >
                  {service.nameAr}
                </p>
                <p className="mt-1 text-sm font-medium text-forest">{service.nameFr}</p>
                <p className="mt-2 text-xs text-muted leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Hadith Quote */}
        <section className="mt-20 rounded-2xl bg-forest px-8 py-12 text-center text-ivory">
          <p
            className="font-heading text-3xl md:text-4xl"
            dir="rtl"
            lang="ar"
          >
            « {HIJAMA_QUOTE} »
          </p>
          <p className="mt-4 text-sm tracking-widest text-gold uppercase">
            حديث شريف — Hadith Prophétique
          </p>
        </section>

        {/* Back to Shop */}
        <div className="mt-16 text-center">
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3 text-sm font-medium text-ivory shadow-md transition-opacity hover:opacity-90"
          >
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
