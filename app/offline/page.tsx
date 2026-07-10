import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = { title: "Offline · TokenLens" };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md pt-16">
      <Card>
        <h1 className="text-lg font-semibold">You are offline</h1>
        <p className="mt-2 text-sm text-ink-2">
          TokenLens needs a connection to generate reports from live market
          data. Pages you visited recently may still open from the cache.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/" className="underline">
            Try again
          </Link>
        </p>
      </Card>
    </div>
  );
}
