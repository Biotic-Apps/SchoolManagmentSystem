// Single source of truth for the product's user-visible name.
// Everything that renders the brand — page titles, the sidebar wordmark, report
// footers, the login screen — reads from here so a rebrand is one edit, not ten.
//
// The wordmark can be two-tone ("e" + "School"), so the name is
// also exposed split into its two parts; keep BRAND === BRAND_PREFIX + BRAND_SUFFIX.

export const BRAND = "eSchool";
export const BRAND_PREFIX = "e";
export const BRAND_SUFFIX = "School";

export const BRAND_TAGLINE = "School management made simple";

/** The document <title> shown in the browser tab. */
export const BRAND_TITLE = `${BRAND} | ${BRAND_TAGLINE}`;

/** Footer copyright line, e.g. "© 2026 eSchool. All rights reserved." */
export const brandCopyright = (year: number) =>
  `© ${year} ${BRAND}. All rights reserved.`;
