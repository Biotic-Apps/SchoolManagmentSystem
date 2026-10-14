/**
 * The one way this application sends email.
 *
 * Lifted out of `lib/server/site-enquiry.ts`, which used to own the only
 * transport. A second `fetch` written beside the first would be two places to
 * configure, two places to get the error handling right, and two answers to
 * "is mail working".
 *
 * ══ THREE TRANSPORTS, CHOSEN BY WHAT IS CONFIGURED ══
 *
 * This started as Resend and only Resend, on the reasoning that it is a single
 * `fetch` with no dependency to add. That reasoning was sound and it is still
 * why Resend is here — but it quietly assumed the operator would choose the
 * provider we chose, and the first real deployment did not: the domain is
 * bought and the mailbox is coming from Zoho, which sells transactional email
 * two different ways and neither of them speaks Resend's API.
 *
 *   · `resend`     RESEND_API_KEY                      — one fetch, no dependency
 *   · `zeptomail`  ZEPTOMAIL_TOKEN                     — Zoho's transactional API, also one fetch
 *   · `smtp`       SMTP_HOST + SMTP_USER + SMTP_PASS   — any mailbox, Zoho Mail included
 *
 * Whichever is configured wins, tried in that order, and `MAIL_TRANSPORT`
 * forces one by name when more than one is set. The ORDER is not arbitrary: a
 * deployment already sending through Resend must not silently change transport
 * on the day somebody adds SMTP credentials for something else, so the
 * incumbent is tried first and switching is a deliberate act.
 *
 * `MAIL_FROM` is the sender in every case, and it must be an address the
 * provider has accepted — a verified domain on Resend and ZeptoMail, the
 * mailbox itself over SMTP. `ENQUIRY_FROM` is still honoured for the contact
 * form so an existing deployment keeps working unchanged.
 *
 * Adding a fourth provider is a `case` in `sendMail` and a row in the table.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * ZeptoMail is regional — `.com`, `.eu` and `.in` are different hosts and a
 * token issued in one is refused by the others, with a message that reads like
 * a bad key rather than a wrong host. Overridable for exactly that reason.
 */
const ZEPTOMAIL_ENDPOINT = "https://api.zeptomail.com/v1.1/email";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type TransportName = "resend" | "zeptomail" | "smtp";

/**
 * The order is the precedence, and the comment at the top of this file says why.
 */
const TRANSPORTS: { name: TransportName; requires: string[] }[] = [
  { name: "resend", requires: ["RESEND_API_KEY"] },
  { name: "zeptomail", requires: ["ZEPTOMAIL_TOKEN"] },
  { name: "smtp", requires: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] },
];

const configured = (names: string[]) => names.every((n) => Boolean(process.env[n]?.trim()));

/**
 * Which transport will actually be used, or `null` when none can be.
 *
 * Exported so an operator can ASK — `npm run mail:check` prints it — because
 * the failure this prevents is a deployment that believes it is sending and is
 * not. Read at call time, never cached: a process started before the key was
 * set must not answer "no" for the rest of its life.
 */
export function mailTransport(): TransportName | null {
  const forced = process.env.MAIL_TRANSPORT?.trim().toLowerCase();
  if (forced) {
    const named = TRANSPORTS.find((t) => t.name === forced);
    /*
      A FORCED transport that is not configured resolves to nothing rather than
      falling back. Falling back would send the mail through a provider the
      operator explicitly did not pick, from a sender that provider has probably
      never verified — a silent success that lands in a spam folder is worse
      than an honest refusal.
    */
    return named && configured(named.requires) ? named.name : null;
  }
  return TRANSPORTS.find((t) => configured(t.requires))?.name ?? null;
}

/**
 * Is there a transport at all?
 *
 * Exported because a feature must be able to REFUSE TO EXIST when mail is not
 * configured, rather than accept work it cannot finish. `deliverEnquiry`
 * already returns `false` and warns, so the contact form tells the visitor to
 * email hello@pixdevelop.com instead of claiming their message arrived.
 */
export function mailConfigured(from?: string): boolean {
  return Boolean(mailTransport() && (from ?? process.env.MAIL_FROM));
}

export type Mail = {
  to: string;
  subject: string;
  html: string;
  /** So hitting reply in the inbox answers the person, not the server. */
  replyTo?: string;
  /** Overrides `MAIL_FROM` — the contact form passes `ENQUIRY_FROM`. */
  from?: string;
  /** Prefixes the log lines, so a failure says which feature lost a message. */
  subsystem?: string;
};

/**
 * `Display Name <someone@example.com>` split into its parts.
 *
 * Resend and SMTP both take the whole string, but ZeptoMail's API wants the
 * name and the address in separate fields — hand it the combined form and it
 * refuses the message as an invalid address.
 */
export function parseAddress(value: string): { name?: string; address: string } {
  const match = value.match(/^\s*(.*?)\s*<\s*([^>]+?)\s*>\s*$/);
  if (!match) return { address: value.trim() };
  const name = match[1].replace(/^"(.*)"$/, "$1").trim();
  return { address: match[2], ...(name ? { name } : {}) };
}

/**
 * Send, and say honestly whether it went.
 *
 * Never throws. Every caller has to decide what an undelivered message means
 * for the thing it was doing — the contact form answers 503 and shows the
 * address instead — and an exception makes
 * that decision by unwinding past it.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  const transport = mailTransport();
  const from = mail.from ?? process.env.MAIL_FROM;
  const tag = `[${mail.subsystem ?? "mail"}]`;

  if (!transport || !from) {
    // Still worth writing down: on a server with no transport this is the only
    // record that the application tried to say something.
    console.warn(`${tag} no transport configured — not delivered`, { to: mail.to, subject: mail.subject });
    return false;
  }

  try {
    switch (transport) {
      case "resend":
        return await sendViaResend(mail, from, tag);
      case "zeptomail":
        return await sendViaZeptoMail(mail, from, tag);
      case "smtp":
        return await sendViaSmtp(mail, from, tag);
    }
  } catch (error) {
    console.error(`${tag} transport threw`, error);
    return false;
  }
}

async function sendViaResend(mail: Mail, from: string, tag: string): Promise<boolean> {
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [mail.to],
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      subject: mail.subject,
      html: mail.html,
    }),
  });

  if (!response.ok) {
    console.error(`${tag} resend rejected the message`, response.status, await response.text().catch(() => ""));
    return false;
  }
  return true;
}

async function sendViaZeptoMail(mail: Mail, from: string, tag: string): Promise<boolean> {
  const token = process.env.ZEPTOMAIL_TOKEN!.trim();
  const sender = parseAddress(from);

  const response = await fetch(process.env.ZEPTOMAIL_ENDPOINT?.trim() || ZEPTOMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      /*
        Zoho's console shows this key WITH the `Zoho-enczapikey ` prefix in one
        place and without it in another, and pasting the wrong one gives a 401
        that says nothing useful. Accept either.
      */
      Authorization: token.toLowerCase().startsWith("zoho-enczapikey") ? token : `Zoho-enczapikey ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { address: sender.address, ...(sender.name ? { name: sender.name } : {}) },
      to: [{ email_address: { address: mail.to } }],
      ...(mail.replyTo ? { reply_to: [{ address: mail.replyTo }] } : {}),
      subject: mail.subject,
      htmlbody: mail.html,
    }),
  });

  if (!response.ok) {
    console.error(`${tag} zeptomail rejected the message`, response.status, await response.text().catch(() => ""));
    return false;
  }
  return true;
}

async function sendViaSmtp(mail: Mail, from: string, tag: string): Promise<boolean> {
  /*
    IMPORTED HERE, not at the top of the file.

    `nodemailer` is a Node-only package that the other two transports do not
    need, and this module is imported by Server Actions and route handlers that
    mostly send nothing at all. A dynamic import keeps it off every one of those
    paths, and keeps a deployment that uses an HTTP provider from paying for a
    dependency it never calls. It is also in `serverComponentsExternalPackages`,
    because bundling it breaks its own internal requires.
  */
  const nodemailer = await import("nodemailer");

  const port = Number(process.env.SMTP_PORT ?? 465);
  /*
    465 is implicit TLS and 587 is STARTTLS, which nodemailer expresses as
    `secure` true and false — get it backwards and the connection hangs until it
    times out rather than failing with anything that names the cause. Derived
    from the port unless it is stated outright.
  */
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE.trim() === "true" : port === 465;

  /*
    A transporter per message. Nodemailer can pool connections, but a pool holds
    a socket open for the life of the process and this application sends a
    handful of messages a day — a sign-in code, a recovery notice, an
    enquiry. Reconnecting costs nothing at that volume and keeps a dead socket
    from turning into a failure nobody can reproduce.
  */
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  /*
    SMTP CAN ACCEPT THE CONNECTION AND STILL REFUSE THE RECIPIENT, and
    nodemailer RESOLVES in that case rather than throwing — the refusal is a
    `rejected` array on the result. Returning true here would report a delivery
    the server explicitly declined, which would tell a school its enquiry
    arrived when it never did.
  */
  const info = (await transporter.sendMail({
    from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
  })) as { rejected?: unknown[]; response?: string };

  if (info?.rejected?.length) {
    console.error(`${tag} smtp accepted the message but refused the recipient`, info.rejected, info.response ?? "");
    return false;
  }
  return true;
}
