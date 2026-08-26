import type { Metadata } from "next";
import { BdccAnalytics } from "@/components/bdcc/BdccAnalytics";
import { BdccLanding } from "@/components/bdcc/BdccLanding";
import { BDCC_CONTENT, BDCC_SITE_URL, bdccUrl } from "@/lib/bdcc";

const title = `BDCC · ${BDCC_CONTENT.nameHe}`;
const description = BDCC_CONTENT.heroSubtitle;
const ogImage = BDCC_CONTENT.gallery.images[0].src;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/bdcc" },
  openGraph: {
    title,
    description,
    url: "/bdcc",
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

// Structured data: the organization and its three course tracks, pointing
// at the official site. Helps rich results and ad landing-page quality.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "BDCC",
  alternateName: BDCC_CONTENT.nameHe,
  url: BDCC_SITE_URL,
  foundingDate: "2017",
  email: BDCC_CONTENT.contact.email,
  telephone: BDCC_CONTENT.contact.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ramat Gan",
    addressCountry: "IL",
  },
  parentOrganization: { "@type": "Organization", name: "CryptoJungle" },
  makesOffer: BDCC_CONTENT.courses.map((course) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Course",
      name: course.title,
      description: course.tagline,
      url: bdccUrl(course.path),
      provider: { "@type": "EducationalOrganization", name: "BDCC" },
    },
  })),
};

export default function BdccLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BdccLanding />
      <BdccAnalytics />
    </>
  );
}
