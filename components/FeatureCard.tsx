import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps) {
  return (
    <article className="bg-cream-card border border-line rounded-card p-6 md:p-7 flex flex-col gap-4 h-full">
      <span className="inline-flex items-center justify-center h-10 w-10 rounded-button bg-teal-100 text-teal-900">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <h3 className="font-serif text-xl text-teal-900">{title}</h3>
      <p className="text-[15px] leading-7 text-ink-muted">{body}</p>
    </article>
  );
}
