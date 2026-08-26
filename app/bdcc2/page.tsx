import type { Metadata } from "next";
import { BdccAnalytics } from "@/components/bdcc/BdccAnalytics";
import { Bdcc2Landing } from "@/components/bdcc2/Bdcc2Landing";
import { BDCC_CONTENT, bdccStructuredData } from "@/lib/bdcc";

const title = `BDCC · ${BDCC_CONTENT.nameHe}`;
const description = BDCC_CONTENT.heroSubtitle;
const ogImage = BDCC_CONTENT.gallery.images[0].src;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/bdcc2" },
  openGraph: {
    title,
    description,
    url: "/bdcc2",
    siteName: "BDCC",
    locale: "he_IL",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 800, alt: BDCC_CONTENT.nameHe }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

const structuredData = bdccStructuredData();

export default function Bdcc2LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Bdcc2Landing />
      <BdccAnalytics />
    </>
  );
}
