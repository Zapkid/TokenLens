import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PositionForm } from "../PositionForm";
import type { SearchResult } from "@/lib/types";

const MOCK_RESULT: SearchResult = {
  id: "bitcoin",
  type: "token",
  name: "Bitcoin",
  symbol: "BTC",
  hint: "Rank #1",
};

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ results: [MOCK_RESULT] }),
    })) as unknown as typeof fetch,
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PositionForm", () => {
  it("shows the mocked search result after typing a query", async () => {
    render(<PositionForm />);

    fireEvent.change(screen.getByLabelText(/asset/i), { target: { value: "bit" } });

    expect(await screen.findByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/search?q=bit"),
      expect.anything(),
    );
  });

  it("enables submit only once an asset, quantity, and cost basis are valid, then adds the position", async () => {
    const onAdded = vi.fn();
    render(<PositionForm onAdded={onAdded} />);

    const submit = screen.getByRole("button", { name: /add position/i });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/asset/i), { target: { value: "bit" } });
    const option = await screen.findByRole("button", { name: /bitcoin/i });
    fireEvent.click(option);

    // Asset alone is not enough: quantity and cost basis are still empty.
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "2" } });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/cost basis/i), { target: { value: "100" } });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    expect(onAdded).toHaveBeenCalledWith(
      expect.objectContaining({
        assetId: "bitcoin",
        assetType: "token",
        name: "Bitcoin",
        symbol: "BTC",
        quantity: 2,
        costBasisUsd: 100,
      }),
    );

    const stored = JSON.parse(
      window.localStorage.getItem("tokenlens:v1:positions") ?? "[]",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      assetId: "bitcoin",
      quantity: 2,
      costBasisUsd: 100,
    });

    // Form resets after a successful submit.
    expect(submit).toBeDisabled();
  });

  it("rejects a non-positive quantity even with a valid asset and cost basis", async () => {
    render(<PositionForm />);

    fireEvent.change(screen.getByLabelText(/asset/i), { target: { value: "bit" } });
    const option = await screen.findByRole("button", { name: /bitcoin/i });
    fireEvent.click(option);

    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/cost basis/i), { target: { value: "100" } });

    expect(screen.getByRole("button", { name: /add position/i })).toBeDisabled();
  });
});
