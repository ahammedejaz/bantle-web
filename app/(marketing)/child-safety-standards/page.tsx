import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Bantle Child Safety Standards",
  description:
    "Bantle’s standards for preventing, reporting, and responding to child sexual abuse and exploitation.",
};

const childSafetySubject = "Child Safety Concern - Bantle";

export default function ChildSafetyStandardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Child safety standards"
        title="Bantle Child Safety Standards"
        intro="Bantle is intended for adults aged 18 and over. We are committed to maintaining a safe platform and we have zero tolerance for child sexual abuse and exploitation."
      />

      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>Our commitment</h2>
          <p>
            Bantle prohibits any content, behavior, or activity involving
            child sexual abuse, child sexual exploitation, grooming,
            sexualization of minors, trafficking, coercion, or any attempt
            to contact, exploit, endanger, or abuse a minor.
          </p>
          <p>
            Bantle also prohibits child sexual abuse material (CSAM), child
            sexual abuse and exploitation (CSAE), requests for CSAM, links
            to CSAM, instructions that facilitate exploitation, or any
            attempt to share, solicit, normalize, or promote abuse involving
            minors.
          </p>
        </section>

        <section>
          <h2>Adult-only service</h2>
          <p>
            Bantle is designed for adults 18+. Users who are under 18 are
            not permitted to create an account or use Bantle.
          </p>
          <p>
            If we learn that an account belongs to a minor, or that an
            account is being used to contact, exploit, endanger, or abuse a
            minor, we may restrict, suspend, or permanently remove the
            account and take additional action where appropriate.
          </p>
        </section>

        <section>
          <h2>Reporting child safety concerns</h2>
          <p>
            Users can report safety concerns inside the Bantle app using the
            report and block tools available from user/chat surfaces.
          </p>
          <p>
            Users and non-users can also report child safety concerns by
            contacting:
          </p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                childSafetySubject,
              )}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            Please include enough detail for us to review the concern, such
            as the user profile, listing, chat, screenshot, timestamp, or
            other relevant information. Do not send illegal content or CSAM
            by email.
          </p>
        </section>

        <section>
          <h2>How Bantle responds</h2>
          <p>Bantle reviews reports and may take action including:</p>
          <ul>
            <li>removing violating content</li>
            <li>restricting or disabling listings</li>
            <li>limiting account access</li>
            <li>suspending or permanently banning accounts</li>
            <li>blocking abusive users from contacting others</li>
            <li>preserving relevant information where legally required</li>
            <li>
              reporting confirmed or suspected CSAM/CSAE to appropriate
              authorities or designated reporting organizations where
              required by law
            </li>
          </ul>
        </section>

        <section>
          <h2>CSAM and CSAE handling</h2>
          <p>
            Bantle does not allow users to share or request CSAM or CSAE
            content. Any confirmed CSAM or CSAE-related activity is treated
            as a severe violation.
          </p>
          <p>
            Where required or appropriate, Bantle may preserve relevant
            account and report information and cooperate with law
            enforcement, regulators, or child safety reporting
            organizations.
          </p>
        </section>

        <section>
          <h2>In-app safety controls</h2>
          <p>
            Bantle provides safety tools that help users report or limit
            unsafe interactions, including:
          </p>
          <ul>
            <li>report user/content tools</li>
            <li>block user controls</li>
            <li>moderation review</li>
            <li>account restrictions for abusive behavior</li>
            <li>
              safety notices reminding users that payments and access are
              coordinated outside Bantle
            </li>
          </ul>
        </section>

        <section className="bg-cream-card border border-line rounded-card p-6">
          <h2 className="mt-0">Child safety point of contact</h2>
          <p>For child safety concerns, contact:</p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                childSafetySubject,
              )}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>Please use the subject line:</p>
          <p>
            <strong>{childSafetySubject}</strong>
          </p>
        </section>

        <section>
          <h2>Compliance with child safety laws</h2>
          <p>
            Bantle aims to comply with applicable child safety laws and
            Google Play&apos;s Child Safety Standards policy. We may update
            these standards as laws, platform requirements, or Bantle safety
            processes evolve.
          </p>
        </section>

        <section>
          <h2>Last updated</h2>
          <p>June 2026</p>
        </section>
      </article>
    </>
  );
}
