import type { ParentLogin, SlipChild } from "./types";

export interface LoginSlipInput {
  schoolName: string | null;
  child: SlipChild | null;
  logins: ParentLogin[];
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const loginPageUrl = () => (typeof window === "undefined" ? "/login" : `${window.location.origin}/login`);

function row(label: string, value: string | null | undefined, strong = false) {
  if (!value) return "";
  const text = strong ? `<strong class="mono">${escape(value)}</strong>` : escape(value);
  return `<tr><th>${escape(label)}</th><td>${text}</td></tr>`;
}

function slip(input: LoginSlipInput, login: ParentLogin) {
  const { child } = input;
  return `<section class="slip">
  <h1>${escape(input.schoolName ?? "School")}</h1>
  <h2>Parent sign-in</h2>
  <table>
    ${row("Parent", login.guardianName)}
    ${row("Child", child?.name)}
    ${row("Admission no.", child?.admissionNo)}
    ${row("Sign in at", loginPageUrl())}
    ${row("Username", [child?.admissionNo, login.email, login.phone].filter(Boolean).join("  or  "), true)}
    ${row("Temporary password", login.temporaryPassword, true)}
  </table>
  <p>Open the school app or website, choose Sign in, type the username and the temporary password.
  You will be asked to choose your own password. Keep this slip private.</p>
</section>`;
}

const STYLE = `body{font-family:system-ui,sans-serif;margin:24px;color:#111}
.slip{border:2px dashed #555;border-radius:12px;padding:16px 20px;margin:0 0 24px;max-width:520px;page-break-inside:avoid}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:4px 0 12px;color:#444;text-transform:uppercase;letter-spacing:.05em}
table{border-collapse:collapse;width:100%}th{text-align:left;font-weight:500;color:#555;padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top}
td{padding:4px 0;word-break:break-all}.mono{font-family:ui-monospace,monospace;font-size:15px}p{font-size:12px;color:#444;margin:12px 0 0}`;

/** Prints one slip per login that has a temporary password, via a hidden frame (no pop-up). */
export function printLoginSlip(input: LoginSlipInput) {
  const slips = input.logins.filter((l) => l.temporaryPassword).map((l) => slip(input, l));
  if (slips.length === 0) return;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Parent sign-in</title><style>${STYLE}</style></head><body>${slips.join("")}</body></html>`,
  );
  doc.close();
  frame.contentWindow!.focus();
  frame.contentWindow!.print();
  setTimeout(() => frame.remove(), 60_000);
}
