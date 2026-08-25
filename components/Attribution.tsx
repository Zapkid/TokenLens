import { SEL } from "@/lib/selectors";

// Data-source attribution row, per the CoinGecko brand attribution guide:
// the CoinGecko name links to coingecko.com next to the gecko mark (drawn
// inline; brand colors from the official lockup). DeFiLlama and
// alternative.me get matching linked credits.

export function CoinGeckoMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      className="inline-block shrink-0"
    >
      <circle cx="20" cy="20" r="19" fill="#f9e988" />
      <path
        d="M27 10c-6.5-3.4-14.5-.6-17 6-1.8 4.8-.4 10.3 3.4 13.6 2.4 2 5.6 3.1 8.6 2.6-1.6-1.5-2.6-3.4-2.6-5.7 0-2.7 1.4-5 3.6-6.3 4-2.5 6.3-4.7 6.5-7 .1-1.2-.9-2.4-2.5-3.2z"
        fill="#8dc63f"
      />
      <circle cx="21.5" cy="14.5" r="4" fill="#ffffff" />
      <circle cx="22.6" cy="14" r="1.9" fill="#0b1220" />
      <circle cx="12.5" cy="21.5" r="1.1" fill="#0b1220" opacity="0.7" />
    </svg>
  );
}

function CreditLink({
  href,
  children,
  testId,
}: {
  href: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      data-testid={testId}
      className="inline-flex items-center gap-1.5 hover:underline"
    >
      {children}
    </a>
  );
}

export function Attribution() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
      <CreditLink
        href="https://www.coingecko.com"
        testId={SEL.attributionCoinGecko}
      >
        <CoinGeckoMark />
        <span>
          Market and onchain data by{" "}
          <span className="font-medium">CoinGecko</span>
        </span>
      </CreditLink>
      <CreditLink href="https://defillama.com">
        TVL data by DeFiLlama
      </CreditLink>
      <CreditLink href="https://alternative.me/crypto/fear-and-greed-index/">
        Fear and Greed by alternative.me
      </CreditLink>
    </div>
  );
}
