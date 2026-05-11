import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  COMPANY_NAME,
  JURISDICTION_CITY,
  LEGAL_EMAIL,
  POLICY_EFFECTIVE_DATE,
} from "@/lib/constants";

export const metadata = {
  title: "Terms of service",
  description:
    "The terms that govern your use of Bantle. We're a discovery and chat platform; deals and payments happen between users.",
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Terms of service"
        title="The rules of using Bantle."
        intro={`Last updated ${POLICY_EFFECTIVE_DATE}. By using Bantle you agree to these terms.`}
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>1. Acceptance of terms</h2>
          <p>
            By installing, signing in to or otherwise using the Bantle
            mobile application (the &ldquo;App&rdquo;), you agree to be
            bound by these Terms of Service (the &ldquo;Terms&rdquo;)
            together with our{" "}
            <Link href="/privacy">privacy policy</Link> and{" "}
            <Link href="/community-guidelines">community guidelines</Link>.
            If you do not agree, please do not use the App.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old and resident in India to use
            Bantle. By signing up, you confirm that you meet these
            eligibility requirements.
          </p>
        </section>

        <section>
          <h2>3. What Bantle is</h2>
          <p>
            Bantle is a discovery and chat platform that helps members find
            each other to share legitimately shareable subscription plans.
            Bantle provides the infrastructure for posting listings,
            chatting, proposing deals and rating other members.
          </p>
        </section>

        <section>
          <h2>4. What Bantle is not</h2>
          <ul>
            <li>Bantle is not a payment processor.</li>
            <li>Bantle is not a party to any deal you reach with another member.</li>
            <li>Bantle does not guarantee that any deal will be honoured.</li>
            <li>Bantle is not affiliated with Spotify, YouTube, Apple, Microsoft, Netflix, Amazon or any other subscription provider mentioned in listings.</li>
            <li>Bantle is not your bank, escrow agent, insurer or arbitrator.</li>
          </ul>
        </section>

        <section>
          <h2>5. Your account</h2>
          <ul>
            <li>
              One account per person. Multiple accounts created by the same
              individual may be suspended.
            </li>
            <li>
              Accurate information. Your name, phone, email and UPI handle
              should be your real ones.
            </li>
            <li>
              Account security is your responsibility. Protect your phone
              number, email and OTPs.
            </li>
            <li>
              You are responsible for everything that happens under your
              account.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. User-generated content</h2>
          <p>
            Listings, profile fields, messages, ratings and reports are all
            user-generated content (&ldquo;Content&rdquo;). By submitting
            Content, you:
          </p>
          <ul>
            <li>
              Grant Bantle a worldwide, non-exclusive, royalty-free license
              to display, store, transmit and operate on that Content
              strictly for the purpose of running the App.
            </li>
            <li>
              Confirm that the Content is yours to post and does not
              infringe any third party&apos;s rights.
            </li>
            <li>
              Confirm that the Content is accurate and not misleading.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Prohibited conduct</h2>
          <p>The following are not allowed on Bantle:</p>
          <ul>
            <li>
              Fraud, impersonation, identity theft or attempts to deceive
              other members.
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
              Posting listings for sharing arrangements that you know
              violate the underlying subscription provider&apos;s terms of
              service. We do not police this actively, but we will remove
              listings reported as such.
            </li>
            <li>
              Discrimination on the basis of caste, religion, gender,
              sexual orientation, region, language, disability or any other
              protected attribute.
            </li>
            <li>
              Posting illegal content, including but not limited to
              child sexual abuse material, glorification of violence,
              instructions for illegal acts or sharing of stolen credentials.
            </li>
            <li>
              Reverse engineering, scraping, automated bulk access, or any
              attempt to interfere with the technical operation of the App.
            </li>
          </ul>
          <p>
            Violations may result in warnings, suspensions or permanent
            removal of your account. Severe violations are referred to law
            enforcement.
          </p>
        </section>

        <section>
          <h2>8. Deals between users</h2>
          <p>
            Any &ldquo;deal&rdquo; reached through Bantle is a contract
            between you and the other member. Bantle is not a party to that
            contract. Bantle does not pre-approve, guarantee, insure or
            underwrite any deal. We provide the discovery and chat tools to
            help you reach an arrangement; the arrangement itself is yours.
          </p>
          <p>
            We may, at our discretion, help mediate behavioural disputes
            (e.g., one party going dark, harassment, account access
            disputes), but we are under no obligation to do so and any
            mediation we provide is informal and non-binding.
          </p>
        </section>

        <section>
          <h2>9. Payments</h2>
          <p>
            All payments between members happen <strong>outside</strong>{" "}
            Bantle, via UPI or any other method you mutually agree on.
            Bantle never collects, holds or routes money on your behalf.
            Bantle is not liable for payment disputes, missed payments,
            erroneous transfers or refunds. Such disputes are resolved
            through the relevant UPI app&apos;s dispute mechanism, your
            bank, or directly between the two members involved.
          </p>
        </section>

        <section>
          <h2>10. Subscription provider terms</h2>
          <p>
            Many family and household subscription plans are governed by
            their providers&apos; own terms — for example, Spotify, Netflix,
            Apple, Microsoft, Amazon and others all impose rules about who
            can share an account or plan. Those rules vary, can change at
            any time, and are entirely outside Bantle&apos;s control.
          </p>
          <p>
            <strong>You are solely responsible</strong> for ensuring that
            the way you choose to share a subscription complies with the
            provider&apos;s terms. Bantle is not affiliated with any
            subscription provider and makes no representation about whether
            a particular sharing arrangement is permitted by them.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            You may delete your account at any time from inside the App. We
            may suspend or terminate your account, with or without notice,
            if we reasonably believe you have violated these Terms or our
            community guidelines, or if we are required to do so by law.
            Pending deals at the time of termination remain entirely
            between the affected members.
          </p>
        </section>

        <section>
          <h2>12. Disclaimers</h2>
          <p>
            The App is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo;. Beyond the warranties expressly required by
            applicable Indian law, Bantle disclaims all warranties whether
            express or implied, including those of merchantability, fitness
            for a particular purpose, accuracy and non-infringement.
          </p>
        </section>

        <section>
          <h2>13. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable Indian law,
            Bantle and its operators will not be liable for any indirect,
            incidental, consequential, special or exemplary damages
            (including for lost savings, missed payments or lost data)
            arising out of or in connection with your use of the App. Where
            liability cannot be excluded, our aggregate liability to you
            is capped at the greater of (a) the fees you have paid Bantle
            in the twelve months preceding the claim (which, since Bantle
            is free, is currently zero) and (b) ₹1,000.
          </p>
        </section>

        <section>
          <h2>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Bantle, its
            affiliates, officers, employees and agents from any claim or
            demand made by a third party that arises out of (a) your use of
            the App, (b) any Content you post, (c) any deal you enter into
            with another member, or (d) your violation of these Terms or
            of applicable law.
          </p>
        </section>

        <section>
          <h2>15. Governing law and dispute resolution</h2>
          <p>
            These Terms are governed by the laws of the Republic of India.
            Subject to the optional arbitration clause below, any disputes
            arising out of or in connection with these Terms or your use of
            the App will be subject to the exclusive jurisdiction of the
            courts at {JURISDICTION_CITY}, India.
          </p>
          <p>
            At Bantle&apos;s sole option, disputes may instead be resolved
            by binding arbitration conducted under the Arbitration and
            Conciliation Act, 1996, by a sole arbitrator appointed by
            Bantle and seated in {JURISDICTION_CITY}, India.
            Proceedings will be conducted in English.
          </p>
        </section>

        <section>
          <h2>16. Changes to these terms</h2>
          <p>
            We may revise these Terms from time to time. If we make a
            material change, we will notify you in-app the next time you
            open Bantle. Continued use of the App after a notice period
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2>17. Contact</h2>
          <p>
            For legal matters, write to{" "}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. The Bantle
            App is operated by {COMPANY_NAME}.
          </p>
        </section>
      </article>
    </>
  );
}
