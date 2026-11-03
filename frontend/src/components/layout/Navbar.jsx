import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { LOGO_SRC, NAV_LINKS, SITE } from "../../config/site";
import { useCart } from "../../context/CartContext";
import Button from "../ui/Button";

function navClass({ isActive }) {
  return [
    "rounded-full px-3 py-2 text-sm tracking-wide transition-colors",
    isActive ? "bg-sage/30 text-forest" : "text-charcoal hover:text-forest",
  ].join(" ");
}

export default function Navbar() {
  const { itemCount } = useCart();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/40 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src={LOGO_SRC}
            alt={`${SITE.name} — ${SITE.slogan}`}
            className="h-12 w-auto object-contain sm:h-14"
          />
          <span className="hidden font-heading text-xl text-forest sm:block lg:hidden xl:block">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            to="/reservation-hijama"
            size="sm"
            className="hidden md:inline-flex"
          >
            Réserver
          </Button>

          <Link
            to="/panier"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-forest transition hover:bg-sage/25"
            aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}
          >
            <ShoppingBag size={22} strokeWidth={1.7} />
            {itemCount > 0 ? (
              <span className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-medium text-ivory">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-forest lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-gold/40 bg-ivory px-5 py-6 lg:hidden"
        >
          <nav className="flex flex-col gap-2" aria-label="Navigation mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  [
                    "rounded-2xl px-4 py-3 text-base",
                    isActive ? "bg-sage/30 text-forest" : "text-charcoal",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Button to="/reservation-hijama" className="mt-3 w-full">
              Réserver une séance
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
