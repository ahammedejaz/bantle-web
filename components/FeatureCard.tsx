import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

// Dark glass card used on the marketing homepage (homepage-only component).
export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-7">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-teal-400/15 text-teal-300">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <h3 className="font-serif text-xl text-cream">{title}</h3>
      <p className="text-[15px] leading-7 text-cream/65">{body}</p>
    </article>
  );
}
