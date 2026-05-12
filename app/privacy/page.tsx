import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  COMPANY_NAME,
  CONTACT_EMAIL,
  GRIEVANCE_EMAIL,
  GRIEVANCE_OFFICER_NAME,
  POLICY_EFFECTIVE_DATE,
  POSTAL_ADDRESS,
  PRIVACY_EMAIL,
} from "@/lib/constants";

export const metadata = {
  title: "Privacy policy",
  description:
    "How Bantle collects, uses, shares and protects your information. Written in plain language with India DPDP Act 2023 in mind.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy policy"
        title="What Bantle does with your data, in plain language."
        intro={`Last updated ${POLICY_EFFECTIVE_DATE}. Effective ${POLICY_EFFECTIVE_DATE}.`}
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>In short</h2>
          <p>
            Bantle is a discovery and chat app. We collect the minimum data
            needed to verify you, run the app, and protect the community.
            We do not sell your data to anybody, ever. We do not handle
            payments, so we don&apos;t hold any financial information about
            you. The rest of this page is the long, careful version of
            that.
          </p>
        </section>

        <section>
          <h2>1. Who we are</h2>
          <p>
            Bantle is operated by {COMPANY_NAME} (&ldquo;Bantle&rdquo;,
            &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), an
            individual based in India. For privacy questions you can reach us at{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> or{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>2. Data we collect</h2>
          <h3>Identity data</h3>
          <ul>
            <li>Indian mobile phone number (required for sign-up via OTP).</li>
            <li>Email address (required to use most features).</li>
            <li>Optional: display name, short bio, profile photo (avatar).</li>
          </ul>

          <h3>Auth data</h3>
          <ul>
            <li>Google OAuth profile (only if you choose to link Google sign-in).</li>
            <li>OTP verification records associated with your phone and email, retained briefly for fraud prevention.</li>
          </ul>

          <h3>Profile data</h3>
          <ul>
            <li>Subscription platforms you express interest in.</li>
            <li>Approximate city-level location (never precise GPS).</li>
            <li>Ratings you receive and give, with associated deal IDs.</li>
          </ul>

          <h3>Communication data</h3>
          <ul>
            <li>Messages you send inside Bantle&apos;s chat.</li>
            <li>Deal proposals, acceptances and milestone check-ins.</li>
            <li>Reports you file about other users, and reports filed about you.</li>
          </ul>

          <h3>Device data</h3>
          <ul>
            <li>Push notification tokens, refreshed regularly.</li>
            <li>Device model, OS version, app version, used for crash and compatibility diagnostics.</li>
          </ul>

          <h3>Usage data</h3>
          <ul>
            <li>Which screens you visit and when, collected anonymously through PostHog once we enable analytics. We do not link this to your identity inside the analytics tool.</li>
          </ul>

          <h3>Data we do not collect</h3>
          <ul>
            <li>Payment information of any kind. Bantle does not process payments.</li>
            <li>Precise GPS or background location.</li>
            <li>Your contacts list, SMS messages or call logs.</li>
            <li>Browsing history outside the Bantle app.</li>
          </ul>
        </section>

        <section>
          <h2>3. How we use your data</h2>
          <ul>
            <li>To run the service: matching hosts with potential sharers, supporting chat and deal flows.</li>
            <li>To verify identity through phone OTP and email confirmation.</li>
            <li>To send transactional emails like verification codes, password resets and deal updates.</li>
            <li>To deliver in-app and push notifications.</li>
            <li>To improve Bantle, in aggregate, through anonymised analytics.</li>
            <li>To investigate reports, enforce our{" "}
              <Link href="/community-guidelines">community guidelines</Link>{" "}
              and protect the integrity of the community.
            </li>
            <li>To comply with applicable Indian law where required.</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-party services we rely on</h2>
          <p>
            Bantle is built on a small number of carefully chosen vendors.
            None of them resell your data. Each operates under their own
            privacy policy, which you should read for completeness:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> — authentication, primary database
              and file storage. Hosted in Asia Pacific regions where
              possible.
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery
              (sign-up verifications, deal updates).
            </li>
            <li>
              <strong>MSG91</strong> — SMS OTP delivery for Indian mobile
              numbers.
            </li>
            <li>
              <strong>Firebase Cloud Messaging</strong> — push notification
              delivery to Android and iOS devices.
            </li>
            <li>
              <strong>Google</strong> — optional Google sign-in for users
              who choose it.
            </li>
            <li>
              <strong>Sentry</strong> — anonymised crash and error
              reporting, planned for a future release.
            </li>
            <li>
              <strong>PostHog</strong> — anonymised in-app analytics,
              planned for a future release.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. How we share data</h2>
          <p>
            We do not sell your data. Full stop. Beyond that, sharing
            happens in three narrow situations:
          </p>
          <ul>
            <li>
              <strong>With users you talk to.</strong> Your name, avatar,
              public ratings and live listings are visible to people you
              chat with — that visibility is the entire point of the app.
            </li>
            <li>
              <strong>With service providers above.</strong> Limited to the
              data each provider needs to operate their narrow function
              (e.g., MSG91 only sees the phone number it sends the OTP to).
            </li>
            <li>
              <strong>With law enforcement.</strong> Only when we are
              compelled by a valid legal request narrowly scoped to a
              specific user or incident, and only to the extent required by
              Indian law.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Data retention</h2>
          <ul>
            <li>
              <strong>Active accounts.</strong> Your data is retained as
              long as your account is active.
            </li>
            <li>
              <strong>Soft-deleted accounts.</strong> When you delete your
              account, we enter a 7-day grace window during which you can
              recover it. After that, identifying data is hard deleted.
            </li>
            <li>
              <strong>Chat messages.</strong> Retained while either
              participant&apos;s account is active. When both accounts are
              deleted, messages are removed.
            </li>
            <li>
              <strong>Anonymised analytics.</strong> Retained for up to 24
              months and then purged.
            </li>
            <li>
              <strong>Audit and compliance logs.</strong> Retained strictly
              as required by Indian law and our security obligations.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Your rights under the DPDP Act 2023</h2>
          <p>
            India&apos;s Digital Personal Data Protection Act 2023 gives
            you certain rights over the personal data we hold about you.
            Specifically, you have:
          </p>
          <ul>
            <li>The right to access the personal data we have about you.</li>
            <li>The right to correct inaccurate personal data.</li>
            <li>
              The right to delete your account and personal data using
              in-app deletion, subject to the soft-delete grace window
              above.
            </li>
            <li>
              The right to nominate someone to exercise your rights in the
              event of your death or incapacity.
            </li>
            <li>The right to grievance redressal.</li>
          </ul>
          <p>
            Our grievance officer is {GRIEVANCE_OFFICER_NAME},
            reachable at{" "}
            <a href={`mailto:${GRIEVANCE_EMAIL}`}>{GRIEVANCE_EMAIL}</a>. We
            acknowledge grievances within 7 days and respond fully within
            30 days.
          </p>
        </section>

        <section>
          <h2>8. Children&apos;s privacy</h2>
          <p>
            Bantle is for adults only — you must be 18 or older to use it.
            We do not knowingly collect personal data from anyone under 18.
            If we discover that an account belongs to a minor, we delete
            its data and disable the account. If you believe a minor has
            created an account, write to{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>9. Security</h2>
          <ul>
            <li>Data is encrypted in transit (TLS) and at rest.</li>
            <li>
              Two-factor identity through phone OTP and email confirmation
              is available for sensitive actions.
            </li>
            <li>
              We review our access controls and dependencies periodically.
            </li>
            <li>
              No system is 100% secure. If you become aware of a
              vulnerability, please report it responsibly to{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
            </li>
          </ul>
        </section>

        <section>
          <h2>10. International data transfers</h2>
          <p>
            Your data is processed primarily inside Asia Pacific regions.
            Some of the vendors listed above (notably Google, Resend) may
            process limited data in other regions. Such transfers are
            governed by each vendor&apos;s own privacy policy and
            applicable cross-border data transfer obligations.
          </p>
        </section>

        <section>
          <h2>11. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. If we make a
            material change, we will notify you in-app the next time you
            open Bantle. Continued use of the app after a notice period
            implies acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>12. How to reach us</h2>
          <p>
            For privacy questions, write to{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. For
            grievance redressal, write to{" "}
            <a href={`mailto:${GRIEVANCE_EMAIL}`}>{GRIEVANCE_EMAIL}</a>.
            For postal contact: {POSTAL_ADDRESS}.
          </p>
        </section>
      </article>
    </>
  );
}
