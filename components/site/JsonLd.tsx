import { headers } from "next/headers";
/** Renders a pre-serialised schema.org graph. Build the string with `jsonLd()`. */
export async function JsonLd({ data }: { data: string }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: data }}
    />
  );
}
