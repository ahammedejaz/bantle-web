interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  intro?: string;
}

export function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <section className="border-b border-line bg-cream">
      <div className="container-x pt-14 pb-12 md:pt-20 md:pb-16">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif italic text-4xl md:text-5xl text-teal-900 leading-[1.1] tracking-tightish text-balance max-w-3xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 text-lg leading-8 text-ink-muted max-w-2xl">
            {intro}
          </p>
        ) : null}
      </div>
    </section>
  );
}
