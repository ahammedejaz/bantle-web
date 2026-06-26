import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

// Elevated light feature card used on the marketing homepage (homepage-only).
export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps) {
  return (
    <article className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-teal-900/10 bg-white p-6 shadow-[0_10px_30px_-12px_rgba(0,60,52,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_28px_60px_-20px_rgba(0,60,52,0.28)] md:p-7">
      {/* subtle mint accent line on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-teal-400 to-teal-300 transition-transform duration-300 group-hover:scale-x-100"
      />
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 ring-1 ring-teal-200/70 transition-colors duration-300 group-hover:from-teal-200 group-hover:to-teal-100 group-hover:text-teal-900">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <h3 className="font-serif text-xl text-teal-900">{title}</h3>
      <p className="text-[15px] leading-7 text-ink-muted">{body}</p>
    </article>
  );
}
