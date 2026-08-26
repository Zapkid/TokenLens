import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = {
  title: "About · TokenLens",
  description:
    "What TokenLens is, how it scores crypto assets, and who runs it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">About TokenLens</h1>
      <Card>
        <div className="space-y-3 text-sm text-ink-2">
          <p>
            TokenLens is an on-demand analysis tool for crypto tokens and
            blockchains. Type an asset name and it builds a full report from
            public market data: opportunity and risk scores across defined
            pillars, a letter risk grade, bear, base, and bull scenario
            trajectories over three horizons, and a disciplined holding
            strategy with tiers, DCA schedules, and exit ladders.
          </p>
          <p>
            The scoring method is fully documented on the{" "}
            <Link href="/methodology" className="underline">
              methodology page
            </Link>
            . Market data comes from CoinGecko, TVL data from DeFiLlama, and
            sentiment from the alternative.me Fear and Greed index. Nothing
            here is financial advice: TokenLens is decision support built for
            personal use, and no score removes the need to size positions so
            that a total loss on any single asset is survivable.
          </p>
          <p>
            TokenLens is a personal, open source project. The full
            implementation, feature documentation, and test plans live in the{" "}
            <a
              href="https://github.com/Zapkid/TokenLens"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              GitHub repository
            </a>
            . Developers and AI agents can use the public REST API and the MCP
            server; the{" "}
            <Link href="/developers" className="underline">
              developer guide
            </Link>{" "}
            has the details.
          </p>
        </div>
      </Card>
    </div>
  );
}
