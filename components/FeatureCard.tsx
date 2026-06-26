import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

// Light feature card used on the marketing homepage (homepage-only component).
export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-line bg-cream-card p-6 shadow-[0_18px_54px_rgba(0,60,52,0.06)] md:p-7">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-teal-100 text-teal-900">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <h3 className="font-serif text-xl text-teal-900">{title}</h3>
      <p className="text-[15px] leading-7 text-ink-muted">{body}</p>
    </article>
  );
}
