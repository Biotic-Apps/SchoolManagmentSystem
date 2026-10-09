import QRCode from "qrcode";
import { slipHtml, SLIP_STYLE, type SlipSchool } from "./login-slip-html";
import { loginPageUrl, parentLoginLink } from "./login-url";
import type { ParentLogin, SlipChild } from "./types";

export { loginPageUrl } from "./login-url";

export interface LoginSlipInput {
  school: SlipSchool;
  child: SlipChild | null;
  logins: ParentLogin[];
}

/** The full printable page (also used for previews). */
export async function loginSlipDocument(input: LoginSlipInput) {
  const qr = await QRCode.toDataURL(parentLoginLink(), { margin: 0, width: 240 });
  const loginUrl = loginPageUrl();
  const slips = input.logins
    .filter((login) => login.status !== "SKIPPED")
    .map((login) => slipHtml({ school: input.school, child: input.child, login, loginUrl, qr }));
  return `<!doctype html><html><head><meta charset="utf-8"><title>Parent sign-in</title><style>${SLIP_STYLE}</style></head><body>${slips.join("")}</body></html>`;
}

/** Prints one branded slip per parent via a hidden frame (no pop-up). */
export async function printLoginSlip(input: LoginSlipInput) {
  if (!input.logins.some((login) => login.status !== "SKIPPED")) return;
  const html = await loginSlipDocument(input);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  // Wait for the logo / photo before the print dialog snapshots the page.
  const images = Array.from(doc.images);
  await Promise.all(images.map((img) => (img.complete ? null : new Promise((done) => (img.onload = img.onerror = done)))));
  frame.contentWindow!.focus();
  frame.contentWindow!.print();
  setTimeout(() => frame.remove(), 60_000);
}
