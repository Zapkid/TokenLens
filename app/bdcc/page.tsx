import type { Metadata } from "next";
import { BdccLanding } from "@/components/bdcc/BdccLanding";
import { BDCC_CONTENT } from "@/lib/bdcc";

export const metadata: Metadata = {
  title: `BDCC · ${BDCC_CONTENT.nameHe}`,
  description: BDCC_CONTENT.heroSubtitle,
};

export default function BdccLandingPage() {
  return <BdccLanding />;
}
