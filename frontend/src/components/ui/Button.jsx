import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-forest text-ivory hover:bg-forest-dark shadow-[0_8px_20px_rgba(54,91,70,0.18)]",
  secondary:
    "bg-sage/30 text-forest hover:bg-sage/50 border border-sage/60",
  outline:
    "bg-transparent text-forest border border-gold hover:bg-gold/20",
  ghost: "bg-transparent text-forest hover:bg-sage/20",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  children,
  to,
  href,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  ].join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
