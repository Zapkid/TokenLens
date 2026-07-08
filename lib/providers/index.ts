import type { DataMode } from "../types";
import { fixtureProvider } from "./fixture";
import { liveProvider } from "./live";
import type { DataProvider } from "./types";

export function currentDataMode(): DataMode {
  return process.env.TOKENLENS_DATA_MODE === "fixture" ? "fixture" : "live";
}

export function getProvider(): DataProvider {
  return currentDataMode() === "fixture" ? fixtureProvider : liveProvider;
}

export type { DataProvider } from "./types";
