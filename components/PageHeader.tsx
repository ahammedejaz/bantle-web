interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  intro?: string;
}

// Shared marketing page header. A soft mint-gradient band with a subtle
// decorative highlight gives every content page a consistent, premium top
// without going dark. Used by the public marketing pages only.
export function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-teal-50 via-cream to-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-teal-200/40 blur-[120px]"
      />
      <div className="container-x relative pt-14 pb-12 md:pt-20 md:pb-16">
        {eyebrow ? (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-teal-700 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-balance font-serif text-4xl italic leading-[1.1] tracking-tightish text-teal-900 md:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
            {intro}
          </p>
        ) : null}
      </div>
      {/* gradient hairline divider into the page body */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent"
      />
    </section>
  );
}
