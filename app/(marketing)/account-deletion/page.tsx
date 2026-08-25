import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import {
  breadcrumbNode,
  jsonLd,
  webPageNode,
} from "@/lib/structured-data";
import { ProseShell } from "@/components/site/ProseShell";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Bantle Account and Data Deletion",
  description:
    "Learn how to request deletion of your Bantle account or specific Bantle data.",
  alternates: {
    canonical: "/account-deletion",
  },
  openGraph: {
    ...OG_BASE,
    url: "/account-deletion",
    title: "Bantle Account and Data Deletion",
    description: "Learn how to request deletion of your Bantle account or specific Bantle data.",
  },
  twitter: {
    ...TWITTER_BASE,
    title: "Bantle Account and Data Deletion",
    description: "Learn how to request deletion of your Bantle account or specific Bantle data.",
  },
};

const structuredData = jsonLd([
  webPageNode({
    path: "/account-deletion",
    name: String(metadata.title),
    description: String(metadata.description),
    type: "WebPage",
  }),
  breadcrumbNode([{ name: "Account deletion", path: "/account-deletion" }]),
]);

const accountDeletionSubject = "Bantle account deletion request";
const dataDeletionSubject = "Bantle data deletion request";

export default function AccountDeletionPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        crumb="Account deletion"
        title="Bantle Account and Data Deletion"
        intro="Bantle gives users control over their account and data."
      />

      <ProseShell>
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
              private chat attachments, report evidence uploaded by the
              account, and identity selfies captured before account metadata is
              removed
            </li>
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
          <p>
            In-app deletion starts with a 7-day recovery window. Once that
            window ends, private-file cleanup and account deletion are processed
            by retryable background jobs. A transient provider failure may delay
            final completion; it does not make the files publicly accessible.
          </p>
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

        <section className="rounded-panel bg-paper-sub p-6 ring-1 ring-edge">
          <h2 className="mt-0">Contact</h2>
          <p>For account or data deletion requests, contact:</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>
      </ProseShell>
    </>
  );
}
