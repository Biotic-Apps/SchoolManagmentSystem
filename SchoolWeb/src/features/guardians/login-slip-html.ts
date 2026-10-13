import { initials } from "@/lib/format";
import { shortUrl } from "./login-url";
import type { ParentLogin, SlipChild } from "./types";

export interface SlipSchool {
  name: string;
  logoUrl: string | null;
}

export interface SlipParts {
  school: SlipSchool;
  child: SlipChild | null;
  login: ParentLogin;
  loginUrl: string;
  /** QR code image (data URL) of the parent sign-in link. */
  qr: string;
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function avatar(child: SlipChild | null) {
  if (child?.photoUrl) return `<img class="photo" src="${escape(child.photoUrl)}" alt="">`;
  return `<div class="photo initials">${escape(initials(child?.name ?? "?"))}</div>`;
}

function credentials({ child, login }: SlipParts) {
  const others = [login.email, login.phone].filter(Boolean).join("  or  ");
  const username = child?.admissionNo ?? login.email ?? login.phone ?? "";
  const rest = child ? others : [login.phone].filter(Boolean).join("");
  const password = login.temporaryPassword
    ? `<div class="label">Temporary password</div><div class="password mono">${escape(login.temporaryPassword)}</div>`
    : `<div class="label">Password</div><div class="strong">The password you already chose</div><div class="muted">Forgot it? Ask the school office to reset it.</div>`;
  return `<div class="creds">
    <div class="label">Parent</div><div class="strong">${escape(login.guardianName)}</div>
    <div class="label">Username</div><div class="mono user">${escape(username)}</div>
    ${rest ? `<div class="muted">or ${escape(rest)}</div>` : ""}
    ${password}
  </div>`;
}

function steps(parts: SlipParts) {
  const temp = !!parts.login.temporaryPassword;
  const items = [
    `Open <b>${escape(shortUrl(parts.loginUrl))}</b> or the eSchool app`,
    temp ? "Type the username and temporary password" : "Type the username and your password",
    temp ? "Choose your own new password" : "See your child’s day, fees and results",
  ];
  return `<ol class="steps">${items.map((text, i) => `<li><span>${i + 1}</span>${text}</li>`).join("")}</ol>`;
}

/** One branded slip; the same layout as the API's bulk PDF. */
export function slipHtml(parts: SlipParts) {
  const { school, child } = parts;
  const logo = school.logoUrl ? `<img class="logo" src="${escape(school.logoUrl)}" alt="">` : "";
  const note = parts.login.temporaryPassword
    ? "You must change this password the first time you sign in. Keep this slip private."
    : "Keep this slip private. Never share your password, even with school staff.";
  return `<section class="slip">
  <header>${logo}<div><h1>${escape(school.name)}</h1><p>Parent portal sign-in</p></div><em>Private · hand to parent</em></header>
  <div class="body">
    <div class="child">${avatar(child)}
      <div class="strong">${escape(child?.name ?? "")}</div>
      ${child?.classLabel ? `<div class="muted">${escape(child.classLabel)}</div>` : ""}
      ${child ? `<div class="muted">Adm. ${escape(child.admissionNo)}</div>` : ""}
    </div>
    ${credentials(parts)}
    <div class="qr"><img src="${parts.qr}" alt=""><b>Scan to sign in</b><small>${escape(shortUrl(parts.loginUrl))}</small></div>
  </div>
  ${steps(parts)}
  <footer>${note}</footer>
</section>`;
}

export const SLIP_STYLE = `@page{size:A4;margin:12mm}*{box-sizing:border-box}
html{color-scheme:light}body{background:#fff;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;margin:0;color:#1F2037;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.slip{border:1px solid #DDD6FE;border-radius:12px;overflow:hidden;margin:0 auto 10mm;max-width:186mm;page-break-inside:avoid}
header{display:flex;align-items:center;gap:10px;background:#7B68EE;color:#fff;padding:10px 14px}
header .logo{width:32px;height:32px;object-fit:contain;background:#fff;border-radius:6px;padding:2px}
header h1{font-size:16px;margin:0}header p{margin:2px 0 0;font-size:11px;color:#DDD6FE}
header em{margin-left:auto;font-style:normal;font-weight:700;font-size:9px;letter-spacing:.06em;text-transform:uppercase}
.body{display:grid;grid-template-columns:150px 1fr 120px;gap:14px;padding:14px}
.photo{width:64px;height:64px;border-radius:50%;object-fit:cover;margin-bottom:8px;display:block}
.initials{display:grid;place-items:center;background:#EDE9FE;color:#7B68EE;font-weight:700;font-size:22px}
.creds{background:#EDE9FE;border-radius:8px;padding:10px 12px}
.label{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:#6B7280;margin-top:6px}.label:first-child{margin-top:0}
.strong{font-weight:700;font-size:13px}.muted{font-size:11px;color:#6B7280}
.mono{font-family:ui-monospace,'Courier New',monospace;font-weight:700}.user{font-size:15px}
.password{font-size:20px;letter-spacing:.08em;color:#7B68EE}
.qr{text-align:center;border:1px solid #DDD6FE;border-radius:8px;padding:8px}.qr img{width:96px;height:96px;display:block;margin:0 auto 6px}
.qr b{display:block;font-size:10px}.qr small{display:block;font-size:9px;color:#6B7280;word-break:break-all}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;list-style:none;margin:0;padding:0 14px 10px;font-size:11px}
.steps li{display:flex;gap:6px;align-items:flex-start}.steps span{flex:none;width:18px;height:18px;border-radius:50%;background:#7B68EE;color:#fff;font-weight:700;font-size:10px;display:grid;place-items:center}
footer{border-top:1px solid #DDD6FE;padding:7px 14px;font-size:10px;color:#6B7280}`;
