"use client";

// Onchain DEX analytics browser behind the email OTP gate. The panel never
// sees the CoinGecko key: it only talks to /api/otp and /api/onchain, and the
// session lives in an httpOnly cookie the server minted.

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { formatCompactUsd, formatPct, formatUsd } from "@/lib/format";
import type { OnchainPool } from "@/lib/onchain";
import { ONCHAIN_NETWORKS } from "@/lib/onchain";
import { SEL } from "@/lib/selectors";

type GateState =
  | "loading"
  | "setup"
  | "locked"
  | "code-sent"
  | "authed";

export function OnchainPanel() {
  const [gate, setGate] = useState<GateState>("loading");
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [code, setCode] = useState("");
  const [network, setNetwork] = useState<string>(ONCHAIN_NETWORKS[0].id);
  const [pools, setPools] = useState<OnchainPool[] | null>(null);
  const [busy, setBusy] = useState(false);

  const loadPools = useCallback(async (net: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/onchain?network=${net}`);
      const json = (await res.json()) as {
        pools?: OnchainPool[];
        error?: string;
      };
      if (res.status === 401) {
        setGate("locked");
        setPools(null);
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "Request failed.");
        return;
      }
      setPools(json.pools ?? []);
      setGate("authed");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/otp");
        const json = (await res.json()) as {
          enabled?: boolean;
          authenticated?: boolean;
        };
        if (!json.enabled) {
          setGate("setup");
          return;
        }
        if (json.authenticated) {
          await loadPools(ONCHAIN_NETWORKS[0].id);
        } else {
          setGate("locked");
        }
      } catch {
        setGate("setup");
      }
    })();
  }, [loadPools]);

  const requestCode = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request" }),
      });
      const json = (await res.json()) as { devCode?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not send the code.");
        return;
      }
      setDevCode(json.devCode ?? "");
      setGate("code-sent");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Verification failed.");
        return;
      }
      setCode("");
      await loadPools(network);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid={SEL.onchainRoot} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Onchain DEX analytics</h1>
        <p className="mt-1 text-sm text-ink-2">
          Trending pools by network, powered by the CoinGecko onchain API. An
          email verification code opens a 10 minute session; while it is
          active, requests go out without further codes.
        </p>
      </div>

      {gate === "loading" ? (
        <Card>
          <p className="text-sm text-ink-2">Checking session…</p>
        </Card>
      ) : null}

      {gate === "setup" ? (
        <Card>
          <h2 className="font-semibold">Not configured</h2>
          <p className="mt-2 text-sm text-ink-2">
            Set TOKENLENS_OTP_EMAIL, TOKENLENS_OTP_SECRET, RESEND_API_KEY and
            COINGECKO_API_KEY in the server environment to enable this page.
            See docs/features/onchain-analytics.md for the setup guide.
          </p>
        </Card>
      ) : null}

      {gate === "locked" || gate === "code-sent" ? (
        <Card>
          <h2 className="font-semibold">Email verification required</h2>
          <p className="mt-2 text-sm text-ink-2">
            A 6 digit code will be sent to the configured owner email. Enter
            it below to start a 10 minute session.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid={SEL.otpRequest}
              onClick={requestCode}
              disabled={busy}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {gate === "code-sent" ? "Resend code" : "Email me a code"}
            </button>
            {gate === "code-sent" ? (
              <>
                <input
                  data-testid={SEL.otpCodeInput}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  placeholder="6 digit code"
                  className="w-32 rounded-md border border-hairline bg-surface px-3 py-2 text-sm tabular"
                />
                <button
                  type="button"
                  data-testid={SEL.otpVerify}
                  onClick={verify}
                  disabled={busy || code.length !== 6}
                  className="rounded-md border border-hairline px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Verify
                </button>
              </>
            ) : null}
          </div>
          {gate === "code-sent" && devCode ? (
            <p className="mt-2 text-xs text-faint">
              Fixture mode code (tests only): <span className="tabular">{devCode}</span>
            </p>
          ) : null}
          {error ? (
            <p data-testid={SEL.otpError} className="mt-2 text-sm text-critical">
              {error}
            </p>
          ) : null}
        </Card>
      ) : null}

      {gate === "authed" ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              Network
              <select
                data-testid={SEL.onchainNetwork}
                value={network}
                onChange={(e) => {
                  setNetwork(e.target.value);
                  void loadPools(e.target.value);
                }}
                className="rounded-md border border-hairline bg-surface px-2 py-1.5 text-sm"
              >
                {ONCHAIN_NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-xs text-faint">
              Session active. It expires about 10 minutes after verification.
            </span>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-critical">{error}</p>
          ) : null}
          <div className="mt-4 overflow-x-auto">
            <table
              data-testid={SEL.onchainTable}
              className="w-full min-w-[560px] text-sm"
            >
              <thead>
                <tr className="border-b border-hairline text-left text-xs text-faint">
                  <th className="py-2 pr-3 font-medium">Trending pool</th>
                  <th className="py-2 pr-3 font-medium">Price</th>
                  <th className="py-2 pr-3 font-medium">24h</th>
                  <th className="py-2 pr-3 font-medium">24h volume</th>
                  <th className="py-2 font-medium">Liquidity</th>
                </tr>
              </thead>
              <tbody>
                {(pools ?? []).map((pool) => (
                  <tr key={pool.address} className="border-b border-hairline/50">
                    <td className="py-2 pr-3 font-medium">{pool.name}</td>
                    <td className="tabular py-2 pr-3">{formatUsd(pool.priceUsd)}</td>
                    <td
                      className={`tabular py-2 pr-3 ${
                        (pool.priceChange24hPct ?? 0) >= 0
                          ? "text-up"
                          : "text-down"
                      }`}
                    >
                      {formatPct(pool.priceChange24hPct)}
                    </td>
                    <td className="tabular py-2 pr-3">
                      {formatCompactUsd(pool.volume24hUsd)}
                    </td>
                    <td className="tabular py-2">
                      {formatCompactUsd(pool.reserveUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-faint">
            Onchain DEX data by{" "}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              CoinGecko
            </a>
            .
          </p>
        </Card>
      ) : null}
    </div>
  );
}
