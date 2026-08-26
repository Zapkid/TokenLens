import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Contact · TokenLens",
  description: "How to reach the TokenLens maintainer.",
  alternates: { canonical: "/contact" },
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Contact</h1>
      <Card>
        <div className="space-y-3 text-sm text-ink-2">
          <p>
            TokenLens is maintained as a personal open source project, so the
            fastest and most reliable way to reach the maintainer is through
            the GitHub repository. Bug reports, data questions, feature
            requests, and security reports are all welcome there.
          </p>
          <ul className="list-disc space-y-2 ps-5">
            <li>
              Open an issue:{" "}
              <a
                href="https://github.com/Zapkid/TokenLens/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                github.com/Zapkid/TokenLens/issues
              </a>{" "}
              (preferred for anything actionable)
            </li>
            <li>
              Browse the source and docs:{" "}
              <a
                href="https://github.com/Zapkid/TokenLens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                github.com/Zapkid/TokenLens
              </a>
            </li>
            {contactEmail ? (
              <li>
                Email:{" "}
                <a href={`mailto:${contactEmail}`} className="underline">
                  {contactEmail}
                </a>
              </li>
            ) : null}
          </ul>
          <p>
            For security issues, please include reproduction steps and avoid
            filing sensitive details publicly; a private note via a minimal
            issue asking for a contact channel works. Response times are best
            effort, this is a one-person project. Before reporting data
            oddities, check the{" "}
            <Link href="/methodology" className="underline">
              methodology page
            </Link>{" "}
            and the data source attributions in the footer, most surprises
            come from upstream provider definitions.
          </p>
        </div>
      </Card>
    </div>
  );
}
