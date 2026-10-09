import { PUBLIC_APP_URL } from "@/config/env";

/** The school's sign-in page: NEXT_PUBLIC_APP_URL, else the address staff are using right now. */
export function loginPageUrl() {
  const base = PUBLIC_APP_URL || (typeof window === "undefined" ? "" : window.location.origin);
  return `${base}/login`;
}

/** What the slip's QR code opens: the sign-in page already in parent mode. */
export const parentLoginLink = () => `${loginPageUrl()}?role=parent`;

/** The address without the scheme, for print. */
export const shortUrl = (url: string) => url.replace(/^https?:\/\//, "");
