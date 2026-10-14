/**
 * Every marketing URL, in one place.
 *
 * Four things read this list, and each one forgets differently — and silently.
 * A page middleware does not treat as public is 302'd to the sign-in form, so
 * it simply never appears. A page `scripts/nav-test.ts` does not exempt is
 * reported as an "orphan page route", which fails `test:ci` and stops the
 * deploy. A page the sitemap omits is one Google never sees. None of those
 * three failures looks like the others, and none of them looks like a missing
 * line in a list — which is exactly why the list is not written out three
 * times.
 *
 * This file must stay free of imports. `middleware.ts` runs on the Edge and
 * reads it, so anything pulled in here has to be Edge-safe forever; plain data
 * is the only version of that promise which cannot be broken later.
 */
export const SITE_PAGES = ["/", "/contact", "/privacy-policy", "/terms", "/signup"] as const;

/**
 * Public, but NOT for the index — the second list, and the reason there are two.
 *
 * `SITE_PAGES` drove three things at once: the middleware bypass, the
 * `nav-test` orphan exemption, and `sitemap.xml`. Those are not the same
 * question. "Reachable without a session" and "worth telling Google about" only
 * looked identical while every public page was a marketing page.
 *
 * They stop being identical the moment a signup flow exists. `/signup/verify`
 * carries a one-time token in its URL; adding it to `SITE_PAGES` to make it
 * reachable would also have published that URL shape to the sitemap. Hence a
 * sibling list: **`middleware.ts` and `scripts/nav-test.ts` read the UNION,
 * `app/sitemap.ts` keeps reading `SITE_PAGES` alone.**
 *
 * Empty until the signup flow lands (§1.6). Written now because the split is
 * the part that has to exist BEFORE the first page needs it — afterwards it is
 * a fix, and the window between is when the token gets indexed.
 *
 * A page here should also render `robots: { index: false }`. The sitemap is
 * what we advertise; it is not the only way a URL is found.
 *
 * NOT everything unauthenticated belongs here. `/signup/done` prints an
 * activation key, and provisioning mints the session before redirecting to it —
 * so it is reachable with the cookie the flow just created and stays
 * session-gated. A page that shows a credential has no business in a bypass
 * list.
 */
export const SITE_PUBLIC_PATHS = [
  /*
    "Which books?" — reached MID sign-in, when one Google account opens more
    than one company. There is no session yet; producing one is what the next
    click does.

    The first real member of this list, and a good illustration of why it is
    not `SITE_PAGES`. The page must be REACHABLE without a session, and it must
    never be INDEXED: it is a step inside somebody's sign-in, it means nothing
    to a visitor who arrives at it cold, and a search result for it would be a
    dead end. It carries nothing either — the candidates are in a sealed
    httpOnly cookie the page cannot read.
  */
  "/login/choose",
  /*
    The verification screen. Public because it is reached from an EMAIL, by
    somebody who has no session and is not yet a customer — and never indexed,
    because its URL carries a one-time token. Publishing that shape to a crawler
    is how token URLs end up in search results.

    `/signup` itself is in `SITE_PAGES` instead: it is the top of the funnel and
    should be indexed. `/signup/done` is in NEITHER — it prints an activation
    key, so it stays session-gated, reachable only with the session the flow
    just minted.
  */
  "/signup/verify",
  /*
    Redeeming a recovery link. Same argument: reached from an email, by somebody
    who by definition cannot sign in, and carrying a single-use token.
  */
  "/login/recover",
] as const;

/** Strip a trailing slash, and treat the empty result as the root. */
const normalise = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

/**
 * Is this pathname one of the marketing pages?
 *
 * The trailing slash is stripped first, and that is not defensive tidiness:
 * middleware runs BEFORE Next's own `/contact/` → `/contact` normalisation, and
 * the match is exact, so a visitor who types the slash — or follows a link that
 * carries one — would be bounced to the login page from a page that is public.
 */
export const isSitePage = (pathname: string) =>
  (SITE_PAGES as readonly string[]).includes(normalise(pathname));

/**
 * Is this pathname reachable without a session?
 *
 * The union, and the one thing middleware should ask. `isSitePage` remains
 * exported because "is this a marketing page" is still a real and different
 * question — but a caller deciding whether to redirect to the login form wants
 * this one.
 */
export const isPublicPath = (pathname: string) => {
  const path = normalise(pathname);
  return (SITE_PAGES as readonly string[]).includes(path)
    || (SITE_PUBLIC_PATHS as readonly string[]).includes(path);
};
