import { Link } from "react-router-dom";
import { LOGO_SRC, NAV_LINKS, SITE } from "../../config/site";

function socialHref(value, kind) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http")) {
    return value;
  }

  if (kind === "whatsapp") {
    return `https://wa.me/${value.replace(/\D/g, "")}`;
  }

  if (kind === "instagram") {
    return `https://instagram.com/${value.replace(/^@/, "")}`;
  }

  return value;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const whatsapp = socialHref(SITE.whatsapp, "whatsapp");
  const instagram = socialHref(SITE.instagram, "instagram");
  const hasContact =
    Boolean(whatsapp || instagram || SITE.phone || SITE.email || SITE.address);

  return (
    <footer className="mt-auto border-t border-gold/50 bg-forest text-ivory">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <img
            src={LOGO_SRC}
            alt={SITE.name}
            className="h-16 w-auto rounded-2xl bg-ivory object-contain p-2"
          />
          <p className="mt-4 font-heading text-2xl">{SITE.name}</p>
          <p className="mt-1 text-sm tracking-[0.2em] text-gold uppercase">
            {SITE.slogan}
          </p>
        </div>

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

        <div>
          <h2 className="font-heading text-xl text-ivory">Boutique & soins</h2>
          <ul className="mt-4 space-y-2 text-sm text-ivory/85">
            <li>
              <Link to="/boutique" className="hover:text-gold">
                Boutique
              </Link>
            </li>
            <li>
              <Link to="/soins" className="hover:text-gold">
                Nos soins
              </Link>
            </li>
            <li>
              <Link to="/reservation-hijama" className="hover:text-gold">
                Réserver une séance
              </Link>
            </li>
            <li>
              <Link to="/panier" className="hover:text-gold">
                Panier
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-xl text-ivory">Contact</h2>
          {hasContact ? (
            <ul className="mt-4 space-y-2 text-sm text-ivory/85">
              {SITE.address ? <li>{SITE.address}</li> : null}
              {SITE.phone ? (
                <li>
                  <a href={`tel:${SITE.phone}`} className="hover:text-gold">
                    {SITE.phone}
                  </a>
                </li>
              ) : null}
              {SITE.email ? (
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:text-gold">
                    {SITE.email}
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <a href={whatsapp} className="hover:text-gold" target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {instagram ? (
                <li>
                  <a href={instagram} className="hover:text-gold" target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ivory/70">
              Les coordonnées seront affichées dès qu’elles seront configurées.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-ivory/10 px-5 py-5 text-center text-xs tracking-wide text-ivory/70">
        © {year} {SITE.name}. Tous droits réservés.
      </div>
    </footer>
  );
}
