import Button from "./Button";
import PageContainer from "./PageContainer";

export default function PlaceholderPage({
  kicker,
  title,
  description,
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel,
}) {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer className="max-w-3xl text-center">
        {kicker ? (
          <p className="mb-4 text-xs font-medium tracking-[0.28em] text-sage uppercase">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-heading text-4xl leading-tight text-forest sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {description}
          </p>
        ) : null}
        {(primaryTo || secondaryTo) && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {primaryTo ? (
              <Button to={primaryTo}>{primaryLabel}</Button>
            ) : null}
            {secondaryTo ? (
              <Button to={secondaryTo} variant="outline">
                {secondaryLabel}
              </Button>
            ) : null}
          </div>
        )}
      </PageContainer>
    </section>
  );
}
