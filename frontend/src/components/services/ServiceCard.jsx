import { useState } from "react";
import { formatPrice } from "../../utils/format";
import Button from "../ui/Button";
import ImagePlaceholder from "../ui/ImagePlaceholder";

export default function ServiceCard({ service }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!service) {
    return null;
  }

  const showImage = Boolean(service.imageUrl) && !imageFailed;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gold/40 bg-ivory shadow-[0_10px_30px_rgba(41,45,39,0.05)]">
      <div className="aspect-[4/3] overflow-hidden bg-sage/15">
        {showImage ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" label="Soin" />
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 py-6">
        <h3 className="font-heading text-2xl text-forest">{service.name}</h3>
        {service.description ? (
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">
            {service.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-charcoal">
          {service.durationMinutes ? (
            <span>{service.durationMinutes} min</span>
          ) : null}
          {service.price != null ? <span>{formatPrice(service.price)}</span> : null}
        </div>

        <div className="mt-auto pt-6">
          <Button to={`/reservation-hijama?service=${service.id}`} className="w-full">
            Réserver
          </Button>
        </div>
      </div>
    </article>
  );
}
