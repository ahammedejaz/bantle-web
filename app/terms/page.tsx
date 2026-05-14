import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  COMPANY_NAME,
  JURISDICTION_CITY,
  LEGAL_EMAIL,
} from "@/lib/constants";
import { CURRENT_VERSION, EFFECTIVE_DATE_DISPLAY } from "@/lib/tos";

export const metadata = {
  title: "Terms of service",
  description:
    "The terms that govern your use of Bantle. We're a household coordination tool; subscription deals and payments happen between household members.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow={`Terms of service · v${CURRENT_VERSION}`}
        title="The rules of using Bantle."
        intro={`Version ${CURRENT_VERSION}. Effective ${EFFECTIVE_DATE_DISPLAY}. By using Bantle you agree to these terms.`}
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
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

        <section>
          <h2>2. What Bantle is</h2>
          <p>
            Bantle is a coordination tool for members of the same
            household to track and split the cost of family-plan
            subscriptions they already share. Each plan in Bantle is
            created by a host (the person who pays the underlying
            subscription provider), populated with members from the
            host&apos;s household, and used to coordinate monthly
            settlement among those members.
          </p>
          <p>Bantle is not:</p>
          <ul>
            <li>
              a marketplace for finding strangers to share subscriptions
              with;
            </li>
            <li>
              an agent, broker, escrow service, payment processor or
              insurer for any subscription arrangement;
            </li>
            <li>
              a party to any agreement between the host of a plan and the
              other members of that plan;
            </li>
            <li>
              affiliated with, sponsored by or endorsed by Spotify,
              YouTube, Apple, Microsoft, Amazon, Disney, JioCinema, Zee5,
              SonyLIV, Audible or any other subscription provider whose
              plans may be coordinated through the Service.
            </li>
          </ul>
          <p>
            Bantle does not facilitate, encourage or assist any violation
            of a subscription provider&apos;s terms of service. Each user
            is solely responsible for ensuring that the way their
            household coordinates a particular plan is permitted by the
            relevant provider.
          </p>
        </section>

        <section>
          <h2>3. Your attestations</h2>
          <p>
            By using Bantle to create or join a coordination plan, you
            attest each of the following on each occasion that you do so:
          </p>
          <ul>
            <li>
              <strong>Household membership.</strong> Every member you
              invite to a plan you host, or every plan you accept an
              invite to, is a member of your household — that is, a
              person residing at the same residential address as you, or
              a family member who qualifies under the relevant
              subscription provider&apos;s definition of household.
            </li>
            <li>
              <strong>Authority.</strong> If you are the host of a plan,
              you have the authority to coordinate that subscription on
              behalf of the household, including authority to add or
              remove members from the plan.
            </li>
            <li>
              <strong>Provider compliance.</strong> You have read, and
              will continue to comply with, the terms of service of each
              underlying subscription provider whose plan you coordinate
              through Bantle. You will not use Bantle to coordinate a
              plan in a way that you know or reasonably suspect violates
              those terms.
            </li>
            <li>
              <strong>No stranger sharing.</strong> You will not use
              Bantle to find, invite or coordinate with persons who are
              not members of your household. Bantle is not provided for,
              and is not designed for, that purpose.
            </li>
            <li>
              <strong>No commercial resale.</strong> You will not use
              Bantle to resell, sublicense or commercialise access to a
              subscription provider&apos;s services in any way that is
              not expressly permitted by the relevant provider.
            </li>
          </ul>
          <p>
            We may, but are not required to, ask you to re-confirm these
            attestations periodically inside the Service, especially when
            you add a new plan or invite a new member to an existing
            plan.
          </p>
        </section>

        <section>
          <h2>4. Your account</h2>
          <ul>
            <li>
              <strong>One account per person.</strong> Multiple accounts
              created by the same individual may be suspended.
            </li>
            <li>
              <strong>Accurate information.</strong> Your name, email and
              UPI handle should be your real ones.
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

        <section>
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
              identifying information about anyone outside your
              household, financial account credentials, or any
              subscription provider&apos;s account passwords.
            </li>
          </ul>
          <p>
            We may remove any Content that violates these Terms or our
            community guidelines, and may suspend or terminate accounts
            of users who post such Content repeatedly.
          </p>
        </section>

        <section>
          <h2>6. Conduct rules</h2>
          <p>The following are not allowed on Bantle:</p>
          <ul>
            <li>
              Using the Service to share subscriptions with persons
              outside your household, in violation of the attestations
              above.
            </li>
            <li>
              Buying, selling, reselling or sublicensing access to a
              subscription provider&apos;s services through Bantle.
            </li>
            <li>
              Sharing account credentials (passwords, OTPs, security
              questions) for any subscription provider&apos;s account
              through Bantle&apos;s chat.
            </li>
            <li>
              Processing or attempting to process payments inside Bantle.
              Bantle does not handle money; settlement happens directly
              between household members on UPI.
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

        <section>
          <h2>7. Plans and settlements between household members</h2>
          <p>
            Any coordination plan you create or join through Bantle is an
            arrangement between you and the other household members on
            that plan. Bantle is not a party to that arrangement. Bantle
            does not pre-approve, guarantee, insure or underwrite any
            plan. We provide the coordination tools to help your
            household keep track of who has paid what; the arrangement
            itself is yours.
          </p>
          <p>
            We may, at our discretion, help mediate behavioural disputes
            between members (e.g., one member harassing another, account
            access disputes), but we are under no obligation to do so and
            any mediation we provide is informal and non-binding.
          </p>
        </section>

        <section>
          <h2>8. Payments</h2>
          <p>
            All payments between household members happen{" "}
            <strong>outside</strong> Bantle, via UPI or any other method
            you mutually agree on. Bantle never collects, holds or routes
            money on your behalf. Bantle is not liable for payment
            disputes, missed payments, erroneous transfers or refunds.
            Such disputes are resolved through the relevant UPI
            app&apos;s dispute mechanism, your bank, or directly between
            the household members involved.
          </p>
        </section>

        <section>
          <h2>9. Subscription provider terms</h2>
          <p>
            Almost every family or household subscription tier is
            governed by terms set by the underlying provider — for
            example, Spotify, Apple, Microsoft, Amazon, YouTube, Disney
            and others all impose rules about who is permitted to share
            an account or plan, what counts as a household, and how
            address verification may be performed.
          </p>
          <p>
            <strong>You are solely responsible</strong> for ensuring
            that the way your household coordinates a subscription
            complies with the provider&apos;s terms. Bantle is not
            affiliated with any subscription provider and makes no
            representation about whether a particular sharing
            arrangement is permitted by them. If a provider takes any
            action against you, your household, or any member of a plan
            you host or joined, that action is between you and the
            provider; Bantle is not a party to it.
          </p>
        </section>

        <section>
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

        <section>
          <h2>11. Termination</h2>
          <p>
            You may delete your account at any time from inside the App.
            We may suspend or terminate your account, with or without
            notice, if we reasonably believe you have violated these
            Terms or our community guidelines, or if we are required to
            do so by law. Pending plans at the time of termination
            remain entirely between the household members involved.
          </p>
        </section>

        <section>
          <h2>12. Disclaimers</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;. Beyond the warranties expressly required
            by applicable Indian law, Bantle disclaims all warranties
            whether express or implied, including those of
            merchantability, fitness for a particular purpose, accuracy
            and non-infringement. Bantle does not warrant that the
            Service will be uninterrupted or error-free, that any
            household coordination will result in a successful split,
            or that any subscription provider will permit a particular
            sharing arrangement.
          </p>
        </section>

        <section>
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

        <section>
          <h2>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Bantle, its
            affiliates, officers, employees and agents from any claim or
            demand made by a third party that arises out of (a) your
            use of the Service, (b) any Content you post, (c) any plan
            you create, host or join with other household members,
            (d) any claim brought by a subscription provider arising
            from your use of the Service, or (e) your violation of these
            Terms or of applicable law.
          </p>
        </section>

        <section>
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

        <section>
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

        <section>
          <h2>17. Contact</h2>
          <p>
            For legal matters, write to{" "}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. The
            Bantle Service is operated by {COMPANY_NAME}.
          </p>
        </section>
      </article>
    </>
  );
}
