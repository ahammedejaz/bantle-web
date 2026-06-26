import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Bantle Account and Data Deletion",
  description:
    "Learn how to request deletion of your Bantle account or specific Bantle data.",
};

const accountDeletionSubject = "Bantle account deletion request";
const dataDeletionSubject = "Bantle data deletion request";

export default function AccountDeletionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account and data deletion"
        title="Bantle Account and Data Deletion"
        intro="Bantle gives users control over their account and data."
      />

      <div className="bg-gradient-to-b from-teal-50/50 via-cream to-cream">
        <div className="container-x py-12 md:py-16">
          <article className="prose-bantle mx-auto max-w-3xl rounded-3xl border border-line bg-white p-6 shadow-[0_22px_60px_-28px_rgba(0,60,52,0.28)] md:p-10">
        <section>
          <p>
            You can request deletion of your Bantle account and associated
            data from inside the Bantle app or by contacting us through the
            details below. This page is public and does not require login.
          </p>
        </section>

        <section>
          <h2>Delete your Bantle account in the app</h2>
          <ol>
            <li>Open the Bantle app.</li>
            <li>Go to Settings.</li>
            <li>Tap Delete account.</li>
            <li>Review the information shown.</li>
            <li>Confirm your account deletion request.</li>
          </ol>
        </section>

        <section>
          <h2>Request account deletion by email</h2>
          <p>
            If you cannot access the app, you can request account deletion
            by emailing:
          </p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                accountDeletionSubject,
              )}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            Please email us from the email address linked to your Bantle
            account and include the subject:
          </p>
          <p>
            <strong>{accountDeletionSubject}</strong>
          </p>
        </section>

        <section>
          <h2>Delete specific data without deleting your account</h2>
          <p>
            You may also request deletion of specific Bantle data without
            deleting your full account. For example, you can request deletion
            of:
          </p>
          <ul>
            <li>profile information</li>
            <li>listings</li>
            <li>saved items</li>
            <li>notification records</li>
            <li>
              chat or deal coordination records where deletion is technically
              and legally possible
            </li>
            <li>
              other account-related data associated with your Bantle account
            </li>
          </ul>
          <p>To request deletion of specific data, email:</p>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                dataDeletionSubject,
              )}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>Please include the subject:</p>
          <p>
            <strong>{dataDeletionSubject}</strong>
          </p>
        </section>

        <section>
          <h2>What data is deleted or anonymized</h2>
          <p>
            When an account deletion request is completed, Bantle deletes or
            anonymizes account-related data where possible, including:
          </p>
          <ul>
            <li>account profile information</li>
            <li>display name and profile details</li>
            <li>listings created by the user</li>
            <li>saved or hidden listing records</li>
            <li>push notification tokens</li>
            <li>notification records</li>
            <li>
              app account identifiers where deletion is technically possible
            </li>
          </ul>
        </section>

        <section>
          <h2>Data we may retain</h2>
          <p>
            Some data may be retained where necessary for legitimate reasons,
            including:
          </p>
          <ul>
            <li>safety and abuse prevention</li>
            <li>fraud prevention</li>
            <li>legal compliance</li>
            <li>dispute handling</li>
            <li>security auditing</li>
            <li>enforcing Bantle&apos;s terms and policies</li>
          </ul>
          <p>
            Retained data is kept only for as long as necessary for these
            purposes.
          </p>
        </section>

        <section>
          <h2>Processing time</h2>
          <p>
            We aim to process deletion requests within a reasonable time after
            verifying the request. We may ask for additional information to
            confirm that the request is from the account owner.
          </p>
        </section>

        <section className="bg-cream-card border border-line rounded-card p-6">
          <h2 className="mt-0">Contact</h2>
          <p>For account or data deletion requests, contact:</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>
          </article>
        </div>
      </div>
    </>
  );
}
