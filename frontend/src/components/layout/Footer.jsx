import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { LOGO_SRC, NAV_LINKS, SITE, WHATSAPP_URL } from "../../config/site";

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.84a8.17 8.17 0 004.78 1.52V6.9a4.85 4.85 0 01-1.01-.21z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/50 bg-forest text-ivory">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-1">
          <img
            src={LOGO_SRC}
            alt={SITE.name}
            className="h-16 w-auto rounded-2xl bg-ivory object-contain p-2"
          />
          <p className="mt-4 font-heading text-2xl">{SITE.name}</p>
          <p className="mt-1 text-sm tracking-[0.2em] text-gold uppercase">{SITE.slogan}</p>

          {/* Social icons */}
          <div className="mt-6">
            <p className="mb-3 text-xs tracking-widest text-ivory/60 uppercase">Réseaux sociaux</p>
            <div className="flex gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#25D366" }}
              >
                <MessageCircle size={18} />
              </a>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)" }}
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@bywijo"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#010101" }}
              >
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h2 className="font-heading text-xl text-ivory">Navigation</h2>
          <ul className="mt-4 space-y-2 text-sm text-ivory/85">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Boutique */}
        <div>
          <h2 className="font-heading text-xl text-ivory">Boutique & soins</h2>
          <ul className="mt-4 space-y-2 text-sm text-ivory/85">
            <li>
              <Link to="/boutique" className="hover:text-gold">Boutique</Link>
            </li>
            <li>
              <Link to="/soins" className="hover:text-gold">Nos soins</Link>
            </li>
            <li>
              <Link to="/reservation-hijama" className="hover:text-gold">Réserver une séance</Link>
            </li>
            <li>
              <Link to="/panier" className="hover:text-gold">Panier</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-heading text-xl text-ivory">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-ivory/85">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-gold">📍</span>
              <span>Iziki, Marrakech, Maroc</span>
            </li>
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <MessageCircle size={16} className="text-green-400" />
                <span>{SITE.whatsappDisplay}</span>
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <InstagramIcon size={16} />
                <span>@{SITE.instagram}</span>
              </a>
            </li>
            <li>
              <Link to="/contact" className="text-gold hover:text-gold/80 underline underline-offset-2">
                Page contact →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10 px-5 py-5 text-center text-xs tracking-wide text-ivory/70">
        © 2024 By Wijo – Love Your Body. Tous droits réservés.
      </div>
    </footer>
  );
}
