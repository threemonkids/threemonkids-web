import Link from "next/link";

export type ServiceItem = {
  id: string;
  cardSrc?: string;
  cardWidth?: number;
  cardHeight?: number;
  name: string;
  statusLabel: string;
  /** Highlighted with lime accent block */
  mainCopy: string;
  /** Multi-line — split on \n */
  supportCopy: string;
  avatarSrc?: string;
  avatarAlt?: string;
  /** If set, a "Learn more" CTA links here */
  href?: string;
  /** If true, render the "Learn more" CTA as visible but non-clickable */
  ctaInactive?: boolean;
  /** If set, this text reveals via a typing animation when the card image is hovered */
  hoverTypingText?: string;
  /** If true, render the card image flat (no 3D rotate/perspective/tilt) */
  staticCard?: boolean;
};

/* ─── Single service row ──────────────────────────────────────────────────── */

function ServiceRow({ service }: { service: ServiceItem }) {
  const supportLines = service.supportCopy.split("\n");

  // Inner card content — image (or fallback) plus optional hover-typing overlay.
  // Wrapped in `relative inline-block` so the absolute overlay positions against
  // the image bounding box, not the column.
  const cardInner = (
    <div className="relative inline-block">
      {service.cardSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={service.cardSrc}
          alt={service.name}
          width={service.cardWidth}
          height={service.cardHeight}
          className="h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px] w-auto select-none"
        />
      ) : (
        <div className="h-[260px] sm:h-[300px] md:h-[340px] lg:h-[380px] aspect-[315/439] rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border-light)] flex items-center justify-center select-none">
          <span className="text-3xl md:text-4xl font-bold text-[var(--color-border-light)] tracking-tighter">
            {service.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      {/* Hover-revealed typing overlay — sits over the image, anchored under
          where "Already Me" appears in the artwork. The wrapper is 19ch wide
          (final text width); translateX is dialled back from -50% to -42% so
          the start of "From" sits ~2 characters to the right of the centered
          position, aligning with the "o" in the artwork. Adjust `top` to align
          vertically and the translateX % to nudge horizontally. */}
      {service.hoverTypingText && (
        <div
          className="already-me-typing-font absolute pointer-events-none text-sm md:text-base"
          style={{
            top: "32%",
            left: "50%",
            transform: "translateX(-42%)",
            width: "19ch",
          }}
        >
          <span className="already-me-typing text-zinc-900">
            {service.hoverTypingText}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row items-center md:items-stretch gap-10 md:gap-0">

      {/* ── Left ~45%: card ───────────────────────────────────────────────── */}
      <div
        className={[
          "md:w-[45%] shrink-0 flex items-center justify-center md:justify-end md:pr-12 lg:pr-16",
          service.hoverTypingText ? "already-me-image-area" : "",
        ].join(" ")}
      >
        {service.staticCard ? (
          // Static — flat diary photo, soft drop-shadow only, no rotate/perspective
          <div className="[filter:drop-shadow(0_12px_28px_rgba(0,0,0,0.5))]">
            {cardInner}
          </div>
        ) : (
          // 3D card — perspective + leaning rotate, settles toward viewer on hover
          <div style={{ perspective: "900px", transform: "translateX(-32px)" }}>
            <div
              className="
                transition-[transform,filter] duration-[450ms] ease-out
                [transform:rotateY(-22deg)_rotateX(8deg)]
                [filter:drop-shadow(0_24px_52px_rgba(0,0,0,0.6))]
                hover:[transform:rotateY(-4deg)_rotateX(2deg)]
                hover:[filter:drop-shadow(0_48px_80px_rgba(0,0,0,0.85))]
              "
            >
              {cardInner}
            </div>
          </div>
        )}
      </div>

      {/* ── Right ~55%: text block ────────────────────────────────────────── */}
      <div className="md:w-[55%] flex flex-col justify-center text-center md:text-left md:pl-12 lg:pl-16">

        {/* Status badge */}
        <span className="inline-flex self-center md:self-start items-center gap-1.5 px-3 py-1 mb-5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-muted)] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
          {service.statusLabel}
        </span>

        {/* Service name */}
        <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-foreground)] mb-5">
          {service.name}
        </h2>

        {/* Main copy — full line highlighted with lime accent, square corners */}
        <p className="text-xl md:text-2xl font-bold leading-snug mb-4 self-center md:self-start">
          <span className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] px-2 py-0.5">
            {service.mainCopy}
          </span>
        </p>

        {/* Supporting copy */}
        <div className="flex flex-col gap-1 mb-8">
          {supportLines.map((line, i) => (
            <p key={i} className="text-base md:text-lg text-[var(--color-muted)] leading-relaxed">
              {line || " "}
            </p>
          ))}
        </div>

        {/* Learn more CTA */}
        {(service.href || service.ctaInactive) && (
          <div className="flex justify-center md:justify-start mb-6">
            {service.href ? (
              <Link
                href={service.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:opacity-75 transition-opacity"
              >
                Learn more →
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:opacity-75 transition-opacity cursor-default select-none"
              >
                Learn more →
              </span>
            )}
          </div>
        )}

        {/* Creator avatar — visual signature element */}
        {service.avatarSrc && (
          <div className="flex justify-center md:justify-end mt-auto pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.avatarSrc}
              alt={service.avatarAlt ?? "creator"}
              className="w-20 md:w-24 h-auto object-contain select-none"
              style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}
            />
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */

type Props = {
  services: ServiceItem[];
  eyebrow?: string;
};

export default function ServicesShowcase({ services, eyebrow }: Props) {
  if (services.length === 0) return null;

  return (
    <section className="px-6 py-20 md:py-28 border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto">

        {eyebrow && (
          <p className="text-xl md:text-2xl font-bold text-[var(--color-accent)] tracking-tight mb-12">
            {eyebrow}
          </p>
        )}

        <div className="flex flex-col gap-24">
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </div>

      </div>
    </section>
  );
}
