"use server";

import { headers } from "next/headers";
import { deliverEnquiry } from "@/lib/server/site-enquiry";
import { CONTACT_COPY } from "@/lib/site/content";

/**
 * The contact form's submit path.
 *
 * On the standalone marketing site this was `POST /api/contact`. It is a Server
 * Action here and deliberately NOT a route file: `scripts/gen-postman.ts` scans
 * every `route.ts` under `app/api/`, and CI's `npm run check:postman` fails
 * when the committed collection does not match the routes — so adding a route
 * would put a marketing form in the mobile API's documentation and break the
 * build until somebody regenerated it. An action is invisible to that
 * generator.
 *
 * The logic below is the route's, unchanged — only its skin (Request/Response)
 * is gone. `EnquiryResult` carries what the status codes used to: `errors` is
 * the 422, `error` is the 400 / 429 / 503.
 *
 * `error` is now the sentence the VISITOR reads, and that is a change of
 * responsibility rather than of wording. The route's strings — "Too many
 * messages.", "No mail transport configured." — were never rendered: the client
 * branched on the status code and printed `CONTACT_COPY` instead. Without a
 * status there is nothing left to branch on, so the phrasing has to be decided
 * here or it leaks. "No mail transport configured." on a public page is both an
 * operator's diagnostic shown to a customer and a fact about our infrastructure
 * that a stranger has no business reading. The diagnostic is not lost — it is
 * logged server-side by `deliverEnquiry`, which is where somebody looking for it
 * would go.
 */
export type EnquiryResult =
  | { ok: true }
  | { errors: Record<string, string> }
  | { error: string };

type EnquiryInput = {
  name: string;
  email: string;
  school: string;
  message: string;
  /** Hidden field — real people leave it empty, bots fill it in. */
  website: string;
};

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A crude per-address throttle.
 *
 * In-process and therefore per-instance: it will not hold a determined attacker
 * off a horizontally scaled deployment, and it is not meant to. What it does
 * stop is the ordinary case — an open endpoint that will accept a thousand
 * submissions a minute from one script. Move this to a shared store if the site
 * ever runs on more than one instance.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // The map would otherwise grow for the lifetime of the process.
  if (hits.size > 5_000) {
    for (const [id, times] of hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) hits.delete(id);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

/**
 * An action has no `Request` to read, so the caller's address comes from
 * `headers()` — the same two headers, in the same order, that the route read.
 */
async function clientKey() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function submitEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  // An action's argument is deserialised from the request body, so it is no
  // more trustworthy than the JSON the route used to parse. This is that
  // route's `catch` around `request.json()`: a payload that is not an object
  // at all is malformed, not invalid.
  if (typeof input !== "object" || input === null) {
    return { error: CONTACT_COPY.failure };
  }

  // Honeypot: pretend everything is fine so the bot does not learn anything.
  if (asString(input.website)) {
    return { ok: true };
  }

  if (rateLimited(await clientKey())) {
    return { error: CONTACT_COPY.tooMany };
  }

  const name = asString(input.name);
  const email = asString(input.email);
  const school = asString(input.school);
  const message = asString(input.message);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (name.length > 120) errors.name = "That name is too long.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "That email address does not look right.";
  if (school.length < 2) errors.school = "Please tell us your school's name.";
  if (school.length > 200) errors.school = "That school name is too long.";
  if (message.length < 10) errors.message = "Please add a little more detail.";
  if (message.length > 4000) errors.message = "That message is too long.";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const delivered = await deliverEnquiry({ name, email, school, message });

  // An `ok` here with nothing configured would tell the visitor their message
  // arrived when it did not. If there is no transport, say so: the failure copy
  // names hello@pixdevelop.com, and the same address is printed beside the form.
  if (!delivered) {
    return { error: CONTACT_COPY.failure };
  }

  return { ok: true };
}
