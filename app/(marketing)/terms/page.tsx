import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import {
  breadcrumbNode,
  jsonLd,
  siteEntityNodes,
  webPageNode,
} from "@/lib/structured-data";
import { ProseShell } from "@/components/site/ProseShell";
import {
  COMPANY_NAME,
  JURISDICTION_CITY,
  LEGAL_EMAIL,
} from "@/lib/constants";
import {
  CURRENT_VERSION,
  EFFECTIVE_DATE,
  EFFECTIVE_DATE_DISPLAY,
} from "@/lib/tos";

export const metadata = {
  title: "Terms of service: the rules for using the app",
  description:
    "The terms that govern your use of Bantle. We coordinate sharing and one-time access; arrangements and payments happen directly between users.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    ...OG_BASE,
    url: "/terms",
    title: "Terms of service: the rules for using the app",
    description: "The terms that govern your use of Bantle. We coordinate sharing and one-time access; arrangements and payments happen directly between users.",
  },
  twitter: {
    ...TWITTER_BASE,
    title: "Terms of service: the rules for using the app",
    description: "The terms that govern your use of Bantle. We coordinate sharing and one-time access; arrangements and payments happen directly between users.",
  },
};

const structuredData = jsonLd([
  ...siteEntityNodes,
  webPageNode({
    path: "/terms",
    name: String(metadata.title),
    description: String(metadata.description),
    type: "WebPage",
    // The date this page itself displays. Never a build timestamp.
    dateModified: EFFECTIVE_DATE,
  }),
  breadcrumbNode([{ name: "Terms of service", path: "/terms" }]),
]);

export default function TermsPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        crumb="Terms of service"
        title="The rules of using Bantle."
        intro={`Version ${CURRENT_VERSION}. Effective ${EFFECTIVE_DATE_DISPLAY}. By using Bantle you agree to these terms.`}
      />
      <ProseShell>
        <section id="1-acceptance-and-eligibility" className="scroll-mt-28">
          <h2>1. Acceptance and eligibility</h2>
          <p>
            By installing, signing in to or otherwise using the Bantle
            mobile application (the &ldquo;App&rdquo;) or this website
            (together, the &ldquo;Service&rdquo;), you agree to be bound
            by these Terms of Service (the &ldquo;Terms&rdquo;) together
            with our <Link href="/privacy">privacy policy</Link> and{" "}
            <Link href="/community-guidelines">community guidelines</Link>,
            which are incorporated by reference. If you do not agree, you
            must not use the Service.
          </p>
          <p>
            You must be at least 18 years old and resident in India to
            use Bantle. By signing up you confirm that you meet these
            eligibility requirements and have the legal capacity to enter
            into a binding contract under Indian law.
          </p>
        </section>

        <section id="2-what-bantle-is" className="scroll-mt-28">
          <h2>2. What Bantle is</h2>
          <p>
            Bantle is a coordination tool for subscription access. Users
            can coordinate monthly sharing or one-time access for a
            remaining subscription period. Each listing is created by a
            host who describes the subscription, price, access duration
            and access notes; users then coordinate directly in chat.
          </p>
          <p>
            One-time access means access for the period shown. It is not
            account selling, ownership transfer, or a remaining duration
            confirmed by Bantle. Users must confirm access, duration,
            price and terms directly before paying outside Bantle.
          </p>
          <p>Bantle is not:</p>
          <ul>
            <li>
              an agent, broker, payment intermediary, payment processor or
              insurer for any subscription arrangement;
            </li>
            <li>
              a party to any agreement between the host of a plan and the
              other members of that plan;
            </li>
            <li>
              affiliated with, sponsored by or endorsed by any subscription
              provider whose plans may be coordinated through the Service.
            </li>
          </ul>
          <p>
            Bantle does not facilitate, encourage or assist any violation
            of a subscription provider&apos;s terms of service. Each user
            is solely responsible for ensuring that the way they
            coordinate monthly sharing or one-time access is permitted by
            the relevant provider.
          </p>
        </section>

        <section id="3-your-attestations" className="scroll-mt-28">
          <h2>3. Your attestations</h2>
          <p>
            By using Bantle to create or join a coordination listing, you
            attest each of the following on each occasion that you do so:
          </p>
          <ul>
            <li>
              <strong>Accurate listing terms.</strong> If you host a
              listing, the monthly price, one-time price, months
              remaining, access method, access notes and other details you
              provide are accurate to the best of your knowledge.
            </li>
            <li>
              <strong>Authority.</strong> If you are the host of a plan,
              you have the authority to coordinate that subscription on
              behalf of that plan, including authority to add or
              remove members from the plan.
            </li>
            <li>
              <strong>Provider compliance.</strong> You have read, and
              will continue to comply with, the terms of service of each
              underlying subscription provider whose access you
              coordinate through Bantle. You will not use Bantle to
              coordinate access in a way that you know or reasonably
              suspect violates those terms.
            </li>
            <li>
              <strong>No commercial access.</strong> You will not use
              Bantle to sublicense or commercialise access to a
              subscription provider&apos;s services in any way that is
              not expressly permitted by the relevant provider.
            </li>
          </ul>
          <p>
            We may, but are not required to, ask you to re-confirm these
            attestations periodically inside the Service, especially when
            you add a new listing, propose a deal or accept a deal.
          </p>
        </section>

        <section id="4-your-account" className="scroll-mt-28">
          <h2>4. Your account</h2>
          <ul>
            <li>
              <strong>One account per person.</strong> Multiple accounts
              created by the same individual may be suspended.
            </li>
            <li>
              <strong>Accurate information.</strong> Your name, email and
              any contact or payment details you choose to share should be
              accurate and belong to you.
            </li>
            <li>
              <strong>Security.</strong> Account security is your
              responsibility. Protect your email account, your sign-in
              credentials, and any verification links sent to you.
            </li>
            <li>
              <strong>Responsibility.</strong> You are responsible for
              everything that happens under your account.
            </li>
            <li>
              <strong>Email-only identifier.</strong> Bantle uses email
              as the primary identifier. We do not collect phone numbers
              and do not use SMS for verification.
            </li>
          </ul>
        </section>

        <section id="5-user-generated-content" className="scroll-mt-28">
          <h2>5. User-generated content</h2>
          <p>
            Plan details, profile fields, messages, ratings and reports
            are all user-generated content (&ldquo;Content&rdquo;). By
            submitting Content, you:
          </p>
          <ul>
            <li>
              grant Bantle a worldwide, non-exclusive, royalty-free
              licence to display, store, transmit and operate on that
              Content strictly for the purpose of running the Service;
            </li>
            <li>
              confirm that the Content is yours to post and does not
              infringe any third party&apos;s rights;
            </li>
            <li>
              confirm that the Content is accurate and not misleading;
            </li>
            <li>
              confirm that the Content does not contain personally
              identifying information about anyone else without their
              consent, financial account credentials, or any
              subscription provider&apos;s account passwords.
            </li>
          </ul>
          <p>
            We may remove any Content that violates these Terms or our
            community guidelines, and may suspend or terminate accounts
            of users who post such Content repeatedly.
          </p>
        </section>

        <section id="6-conduct-rules" className="scroll-mt-28">
          <h2>6. Conduct rules</h2>
          <p>The following are not allowed on Bantle:</p>
          <ul>
            <li>
              Commercialising or sublicensing access to a subscription
              provider&apos;s services through Bantle.
            </li>
            <li>
              Describing one-time access as account sale, ownership
              transfer, or any access assurance confirmed by Bantle.
            </li>
            <li>
              Sharing account credentials (passwords, OTPs, security
              questions) for any subscription provider&apos;s account
              through Bantle&apos;s chat.
            </li>
            <li>
              Processing or attempting to process payments inside Bantle.
              Bantle does not handle money; settlement happens directly
              between users outside Bantle.
            </li>
            <li>
              Fraud, impersonation, identity theft or attempts to deceive
              other members or Bantle.
            </li>
            <li>
              Harassment, threats, hate speech, sexual content, or any
              behaviour intended to demean another member.
            </li>
            <li>
              Spam, off-platform solicitation, or attempts to redirect
              users to competing platforms or unrelated services.
            </li>
            <li>
              Discrimination on the basis of caste, religion, gender,
              sexual orientation, region, language, disability or any
              other protected attribute.
            </li>
            <li>
              Posting illegal content, including but not limited to child
              sexual abuse material, glorification of violence,
              instructions for illegal acts or sharing of stolen
              credentials.
            </li>
            <li>
              Reverse engineering, scraping, automated bulk access, or
              any attempt to interfere with the technical operation of
              the Service.
            </li>
          </ul>
          <p>
            Violations may result in warnings, suspensions or permanent
            removal of your account. Severe violations are referred to
            law enforcement.
          </p>
        </section>

        <section id="7-listings-deals-and-direct-coordination" className="scroll-mt-28">
          <h2>7. Listings, deals and direct coordination</h2>
          <p>
            Any coordination plan you create or join through Bantle is an
            arrangement between you and the other user. Bantle is not a
            party to that arrangement. Bantle does not pre-approve,
            verify, promise, insure or underwrite any listing, deal,
            access duration or payment. We provide coordination tools; the
            arrangement itself is yours.
          </p>
          <p>
            We may, at our discretion, help mediate behavioural disputes
            between members (e.g., one member harassing another, account
            access disputes), but we are under no obligation to do so and
            any mediation we provide is informal and non-binding.
          </p>
          <p>
            Before a member proposes, accepts or confirms a deal in the
            App, Bantle may require an explicit safety acknowledgement.
            That acknowledgement confirms that Bantle does not process or
            verify payments, does not promise access or subscription
            duration, and is not responsible for scams, failed access,
            refunds, losses or disputes. Users must confirm access
            details, duration, price and terms directly with each other
            before paying. Any payment is made outside Bantle at the
            user&apos;s own risk.
          </p>
        </section>

        <section id="8-payments" className="scroll-mt-28">
          <h2>8. Payments</h2>
          <p>
            All payments between users happen{" "}
            <strong>outside</strong> Bantle by a method you mutually
            agree on. Bantle never collects, holds, routes, processes or
            verifies money on your behalf. Bantle does not promise
            access, subscription duration, refunds or compensation, and
            is not liable for payment disputes, missed payments,
            erroneous transfers, scams, failed access, losses or refunds.
            Such disputes are resolved through your bank, payment
            provider, appropriate legal channels, or directly between the
            users involved.
          </p>
        </section>

        <section id="9-subscription-provider-terms" className="scroll-mt-28">
          <h2>9. Subscription provider terms</h2>
          <p>
            Subscription plans are governed by terms set by the
            underlying provider. Providers may impose rules about who is
            permitted to share or buy access to an account or plan — for
            example, some family or household plans may require members to
            live in the same household or location, or to belong to an
            approved family group — and how any address or eligibility
            verification is performed.
          </p>
          <p>
            <strong>You are solely responsible</strong> for ensuring that
            the way you list, request, or buy access complies with the
            provider&apos;s terms. You must not use Bantle to list,
            request, or buy access in a way that violates those terms.
            Bantle is not affiliated with any subscription provider and
            makes no representation about whether a particular arrangement
            is permitted by them. If a provider takes any action against
            you or any member of a plan you host or joined, that action is
            between you and the provider; Bantle is not a party to it.
          </p>
        </section>

        <section id="10-privacy-and-data" className="scroll-mt-28">
          <h2>10. Privacy and data</h2>
          <p>
            Our handling of your personal data is described in detail in
            our <Link href="/privacy">privacy policy</Link>. By using
            Bantle you acknowledge our collection, use and storage of
            data as described there, including anonymised analytics via
            PostHog and crash reporting via Bugsnag.
          </p>
          <p>
            Under India&apos;s Digital Personal Data Protection Act 2023
            you have the right to access, correct and delete personal
            data we hold about you, and to nominate someone to exercise
            those rights on your behalf. See the privacy policy for the
            process and our grievance officer&apos;s details.
          </p>
        </section>

        <section id="11-termination" className="scroll-mt-28">
          <h2>11. Termination</h2>
          <p>
            You may delete your account at any time from inside the App.
            We may suspend or terminate your account, with or without
            notice, if we reasonably believe you have violated these
            Terms or our community guidelines, or if we are required to
            do so by law. Pending plans at the time of termination
            remain entirely between the members involved.
          </p>
        </section>

        <section id="12-disclaimers" className="scroll-mt-28">
          <h2>12. Disclaimers</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;. Beyond the warranties expressly required
            by applicable Indian law, Bantle disclaims all warranties
            whether express or implied, including those of
            merchantability, fitness for a particular purpose, accuracy
            and non-infringement. Bantle does not warrant that the
            Service will be uninterrupted or error-free, that any
            coordination will result in a successful split,
            that a member will provide access for any particular
            duration, that a member will refund you, or that any
            subscription provider will permit a particular sharing
            arrangement.
          </p>
        </section>

        <section id="13-limitation-of-liability" className="scroll-mt-28">
          <h2>13. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable Indian law,
            Bantle and its operators will not be liable for any
            indirect, incidental, consequential, special or exemplary
            damages (including for lost savings, missed payments, lost
            data, or actions taken against you by a subscription
            provider) arising out of or in connection with your use of
            the Service. Where liability cannot be excluded, our
            aggregate liability to you is capped at the greater of (a)
            the fees you have paid Bantle in the twelve months preceding
            the claim (which, since Bantle is free, is currently zero)
            and (b) ₹1,000.
          </p>
        </section>

        <section id="14-indemnification" className="scroll-mt-28">
          <h2>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Bantle, its
            affiliates, officers, employees and agents from any claim or
            demand made by a third party that arises out of (a) your
            use of the Service, (b) any Content you post, (c) any plan
            you create, host or join with other members,
            (d) any claim brought by a subscription provider arising
            from your use of the Service, or (e) your violation of these
            Terms or of applicable law.
          </p>
        </section>

        <section id="15-governing-law-and-dispute-resolution" className="scroll-mt-28">
          <h2>15. Governing law and dispute resolution</h2>
          <p>
            These Terms are governed by the laws of the Republic of
            India. Subject to the optional arbitration clause below, any
            disputes arising out of or in connection with these Terms
            or your use of the Service will be subject to the exclusive
            jurisdiction of the courts at {JURISDICTION_CITY}, India.
          </p>
          <p>
            At Bantle&apos;s sole option, disputes may instead be
            resolved by binding arbitration conducted under the
            Arbitration and Conciliation Act, 1996, by a sole arbitrator
            appointed by Bantle and seated in {JURISDICTION_CITY},
            India. Proceedings will be conducted in English.
          </p>
        </section>

        <section id="16-changes-to-these-terms" className="scroll-mt-28">
          <h2>16. Changes to these Terms</h2>
          <p>
            We may revise these Terms from time to time. When we make a
            material change we bump the version number (these Terms are
            currently v{CURRENT_VERSION}) and update the effective date
            shown at the top of this page. The mobile app will prompt
            you to re-accept the revised Terms the next time you open
            it; continued use of the Service after re-acceptance
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section id="17-contact" className="scroll-mt-28">
          <h2>17. Contact</h2>
          <p>
            For legal matters, write to{" "}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. The
            Bantle Service is operated by {COMPANY_NAME}.
          </p>
        </section>
      </ProseShell>
    </>
  );
}
