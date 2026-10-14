/**
 * Every link to the product lives here.
 *
 * The site and the app are ONE deployment, so the sign-in link is the relative
 * path `/login`: same origin, same scheme, whatever the deployment turns out to
 * be. That is also why nothing here opens in a new tab.
 *
 * eSchool is not sold per seat and has no self-serve signup: schools are set up
 * by the team, so the only account action anywhere on the site is "Sign in".
 *
 * `SUPPORT_EMAIL` is printed in the footer and on the contact page. Override it
 * with `NEXT_PUBLIC_SUPPORT_EMAIL` so a deployment can correct it without a code
 * change.
 */

/** Sign-in is internal. A plain path, so it cannot point anywhere but this app. */
export const SIGN_IN_URL = "/login";

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@pixdevelop.com";

/** The studio that builds eSchool, credited in the footer. */
export const MAKER = { name: "Pixdevelop", email: "hello@pixdevelop.com" } as const;

/**
 * The canonical origin of this site, used for metadata, sitemap and JSON-LD.
 *
 * `metadataBase` is derived from this value, so every absolute URL — the OG
 * image, `og:url`, the canonical tag, the sitemap and the JSON-LD — names this
 * host. Set `NEXT_PUBLIC_SITE_ORIGIN` on any deployment served from elsewhere,
 * or crawlers and share cards will follow URLs that host does not serve.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://eschool-web-s9tq.onrender.com";

/**
 * Header navigation, grouped under two menus rather than laid out flat. Legal
 * pages live in the footer, where people look for them.
 */
export type NavMenuItem = { label: string; href: string; detail: string };
export type NavMenu = { label: string; items: NavMenuItem[] };

export const NAV_MENUS: NavMenu[] = [
  {
    label: "Product",
    items: [
      { label: "Attendance & diary", href: "/#attendance", detail: "Marked offline, synced later" },
      { label: "Exams & results", href: "/#academics", detail: "Marks, results, report cards" },
      { label: "Fees & payroll", href: "/#fees", detail: "Challans, dues, salaries" },
      { label: "Parent portal", href: "/#parents", detail: "Every child, one login" },
      { label: "All modules", href: "/#modules", detail: "The whole school, one system" },
    ],
  },
  {
    label: "Why eSchool",
    items: [
      { label: "How it works", href: "/#how-it-works", detail: "From setup to first day" },
      { label: "Built for Pakistan", href: "/#built-for-pakistan", detail: "Rupees, challans, local terms" },
      { label: "Security & trust", href: "/#security", detail: "Roles, branches, audit trail" },
      { label: "FAQ", href: "/#faq", detail: "Answers before you ask" },
    ],
  },
];

/** Flat links that sit beside the menus. */
export const NAV_LINKS = [{ label: "Contact", href: "/contact" }] as const;

type FooterLink = {
  label: string;
  href: string;
  /** Opens in a new tab. No entry sets it today; kept for genuinely outbound links. */
  external?: boolean;
};

type FooterColumn = { title: string; links: FooterLink[] };

/** Every entry points at a real section or page — no placeholder links. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Attendance & diary", href: "/#attendance" },
      { label: "Exams & results", href: "/#academics" },
      { label: "Fees & payroll", href: "/#fees" },
      { label: "Parent portal", href: "/#parents" },
      { label: "All modules", href: "/#modules" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Built for Pakistan", href: "/#built-for-pakistan" },
      { label: "Security & trust", href: "/#security" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
      { label: "Sign in", href: SIGN_IN_URL },
    ],
  },
];
