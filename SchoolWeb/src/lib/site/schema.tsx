import { FAQ, SITE } from "@/lib/site/content";
import { MAKER, SITE_ORIGIN, SUPPORT_EMAIL } from "@/lib/site/links";

/**
 * Structured data, so the things a school searches for are things the site can
 * actually be found by.
 *
 * The FAQ matters most: its answers cover fees and challans, offline attendance,
 * the parent portal and data safety — close to the full list of what a principal
 * types into a search box before choosing school management software. `FAQPage`
 * is what lets those answers be matched against the question.
 *
 * No `offers`: eSchool is not sold per seat and publishes no price.
 */

export function organisationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/favicon.ico`,
    description: SITE.description,
    parentOrganization: { "@type": "Organization", name: MAKER.name, email: MAKER.email },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        areaServed: "PK",
        availableLanguage: ["en"],
      },
    ],
  };
}

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "School management system",
    operatingSystem: "Web, Android",
    url: SITE_ORIGIN,
    description: SITE.description,
    areaServed: { "@type": "Country", name: "Pakistan" },
    author: { "@type": "Organization", name: MAKER.name },
    featureList: [
      "Admissions and student records",
      "Offline attendance on Android",
      "Timetable, diary and homework",
      "Exams, results and report cards",
      "Fee challans and payment tracking",
      "Staff payroll and expenses",
      "Parent portal and messaging",
      "Role and branch based permissions",
    ],
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: { "@type": "Answer", text: entry.a },
    })),
  };
}

/**
 * Renders a JSON-LD block.
 *
 * `JSON.stringify` output is escaped before it goes into the script tag: a `<`
 * inside any copy would otherwise be able to close the element early, and the
 * copy in this repo is edited by people, not by a schema.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
