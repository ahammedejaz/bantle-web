import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import {
  breadcrumbNode,
  jsonLd,
  siteEntityNodes,
  webPageNode,
} from "@/lib/structured-data";
import { CONTACT_EMAIL, FEEDBACK_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Support: get help with an account or a deal",
  description:
    "Reach a real person at Bantle. Support, feedback and press contacts, plus a quick troubleshooting checklist before you write.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    ...OG_BASE,
    url: "/support",
    title: "Support: get help with an account or a deal",
    description: "Reach a real person at Bantle. Support, feedback and press contacts, plus a quick troubleshooting checklist before you write.",
  },
  twitter: {
    ...TWITTER_BASE,
    title: "Support: get help with an account or a deal",
    description: "Reach a real person at Bantle. Support, feedback and press contacts, plus a quick troubleshooting checklist before you write.",
  },
};

const structuredData = jsonLd([
  ...siteEntityNodes,
  webPageNode({
    path: "/support",
    name: String(metadata.title),
    description: String(metadata.description),
    type: "ContactPage",
  }),
  breadcrumbNode([{ name: "Support", path: "/support" }]),
]);

export default function SupportPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        crumb="Support"
        title="Talk to a real person at Bantle."
        intro="We're a small team — emails come straight to humans, not a triage queue. We aim to reply within two business days."
      />
      <div className="bg-canvas">
        <div className="container-x py-14 md:py-20">
          <div className="mx-auto max-w-[46rem]">
        <section className="grid gap-4 sm:grid-cols-2">
          <ContactCard
            label="General support"
            email={CONTACT_EMAIL}
            body="Account questions, trouble using the app, bug reports, listings and deals."
          />
          <ContactCard
            label="Product feedback"
            email={FEEDBACK_EMAIL}
            body="Feature requests, what's confusing, what's working, anything you wish Bantle did differently."
          />
        </section>

        <section className="mt-14 prose-bantle">
          <h2>Before you email</h2>
          <p>
            A surprising number of issues clear up after one of these:
          </p>
          <ul>
            <li>
              Force-quit and reopen the app. Most temporary glitches go
              away.
            </li>
            <li>
              Check your inbox, spam, and promotions folders for emails
              from Bantle, especially when a sign-in or verification email
              hasn&apos;t arrived. Switching between Wi-Fi and mobile data
              can also help.
            </li>
            <li>
              Update Bantle to the latest available version for your device
              on Android or iOS. Once we go live, we&apos;ll push fixes
              regularly and older versions sometimes hit edge cases.
            </li>
            <li>
              Check the{" "}
              <Link href="/faq">FAQ</Link> — about three quarters of
              support emails turn out to be questions already answered
              there.
            </li>
          </ul>
        </section>

        <section className="mt-12 prose-bantle">
          <h2>What to include in your email</h2>
          <p>
            We can help much faster if you include a few specifics up front:
          </p>
          <ul>
            <li>The email address you use to sign in (so we can find your account).</li>
            <li>Your device — model, Android or iOS version, app version.</li>
            <li>What you were trying to do, and what happened instead.</li>
            <li>A screenshot if anything looked unusual.</li>
            <li>Any error message you saw, copied or photographed.</li>
          </ul>
        </section>

        <section className="mt-12 prose-bantle">
          <h2>Press and partnerships</h2>
          <p>
            For press inquiries, write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=%5BPRESS%5D`}>
              {CONTACT_EMAIL}
            </a>{" "}
            with the subject line <code>[PRESS]</code>. For partnership or
            integration ideas, same address with subject{" "}
            <code>[PARTNERSHIP]</code>.
          </p>
        </section>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactCard({
  label,
  email,
  body,
}: {
  label: string;
  email: string;
  body: string;
}) {
  return (
    <a
      href={`mailto:${email}`}
      className="press group flex flex-col rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lift hover:ring-accent/40"
    >
      <p className="mb-3 text-[12.5px] font-medium text-fg-muted">
        {label}
      </p>
      <span className="inline-flex items-center gap-1.5 font-display text-[19px] font-semibold tracking-tight text-heading transition-colors group-hover:text-accent">
        {email}
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-accent transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>
      <p className="mt-3 text-[15px] leading-[1.7] text-fg-muted">{body}</p>
    </a>
  );
}
