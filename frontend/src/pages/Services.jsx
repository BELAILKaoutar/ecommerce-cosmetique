import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, Heart, Clock, MapPin } from "lucide-react";
import {
  BYWIJO_SERVICES,
  HIJAMA_QUOTE,
  HIJAMA_QUOTE_SOURCE,
  SITE,
  WHATSAPP_URL,
} from "../config/site";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";

function buildWhatsAppUrl(message = "") {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export default function Services() {
  return (
    <div>
      {/* ─── En-tête ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-forest to-forest-dark py-20 text-ivory">
        <PageContainer className="text-center">
          <span className="inline-block rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
            Nos Soins
          </span>
          <h1 className="mt-5 font-heading text-4xl sm:text-5xl text-ivory">
            Un moment rien que pour vous
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-ivory/80">
            Des soins traditionnels marocains et thérapeutiques, disponibles
            au centre ou à domicile à Marrakech. Réservez via WhatsApp en
            quelques secondes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button to="/reservation-hijama" size="lg">
              <Heart size={18} />
              Réserver une séance
            </Button>
            <a
              href={buildWhatsAppUrl(
                `Bonjour By Wijo – Love Your Body 🌸\n\nJe souhaite des informations sur vos soins.\n\nMerci !`
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ivory/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-ivory transition hover:bg-white/20"
            >
              <MessageCircle size={18} />
              Nous contacter
            </a>
          </div>
        </PageContainer>
      </section>

      {/* ─── Citation hadith ──────────────────────────────────────── */}
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

      {/* ─── Cartes des services ─────────────────────────────────── */}
      <section className="py-20 bg-cream">
        <PageContainer>
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl text-forest">
              Toutes nos prestations
            </h2>
            <p className="mt-3 text-muted max-w-xl mx-auto">
              Choisissez votre soin et contactez-nous directement via WhatsApp pour réserver votre créneau.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BYWIJO_SERVICES.map((service) => (
              <article
                key={service.id}
                className="group flex flex-col rounded-3xl border border-gold/40 bg-ivory shadow-xs transition hover:border-forest/60 hover:shadow-md overflow-hidden"
              >
                {/* En-tête colorée */}
                <div className="flex items-center gap-4 bg-forest/5 px-6 pt-6 pb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-3xl">
                    {service.emoji}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-heading text-xl text-forest leading-snug"
                      dir="rtl"
                      lang="ar"
                    >
                      {service.nameAr}
                    </p>
                    <p className="text-xs text-muted font-semibold uppercase tracking-wide mt-0.5 truncate">
                      {service.nameFr}
                    </p>
                  </div>
                </div>

                {/* Corps */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm leading-relaxed text-charcoal/75 flex-1">
                    {service.description}
                  </p>

                  <div className="mt-5 flex flex-col gap-2">
                    {/* Réserver */}
                    <Link
                      to={`/reservation-hijama?service=${service.id}`}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-forest-dark"
                    >
                      <Heart size={14} />
                      Réserver ce soin
                    </Link>

                    {/* WhatsApp */}
                    <a
                      href={buildWhatsAppUrl(
                        `Bonjour By Wijo – Love Your Body 🌸\n\nJe souhaite des informations sur : ${service.nameFr} (${service.nameAr})\n\nMerci !`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2.5 text-xs font-semibold text-[#1a9e4e] transition hover:bg-[#25D366]/20"
                    >
                      <MessageCircle size={14} />
                      Renseignements WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ─── Infos pratiques ─────────────────────────────────────── */}
      <section className="py-14 bg-ivory border-t border-gold/30">
        <PageContainer>
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div className="rounded-2xl border border-gold/40 bg-cream p-6">
              <Clock size={28} className="mx-auto text-forest mb-3" />
              <h3 className="font-heading text-lg text-forest">Horaires</h3>
              <p className="mt-2 text-sm text-muted">
                Sur rendez-vous uniquement.<br />7j/7 selon disponibilités.
              </p>
            </div>
            <div className="rounded-2xl border border-gold/40 bg-cream p-6">
              <MapPin size={28} className="mx-auto text-forest mb-3" />
              <h3 className="font-heading text-lg text-forest">Localisation</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {SITE.address}
              </p>
            </div>
            <div className="rounded-2xl border border-gold/40 bg-cream p-6">
              <MessageCircle size={28} className="mx-auto text-[#25D366] mb-3" />
              <h3 className="font-heading text-lg text-forest">Réservation</h3>
              <p className="mt-2 text-sm text-muted">
                Via WhatsApp ou notre formulaire en ligne.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#25D366] hover:underline"
              >
                {SITE.whatsappDisplay} <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
