import { SUPPORT_EMAIL } from "@/lib/site/links";
import { escapeHtml, mailConfigured, sendMail } from "@/lib/server/mail";

export type Enquiry = {
  name: string;
  email: string;
  school: string;
  message: string;
};

/**
 * Where a contact-form enquiry actually goes.
 *
 * Until this file existed the route logged the enquiry to stdout and returned
 * `{ ok: true }`, so every message sent through the site was lost and the
 * sender was told it had arrived. That is worse than having no form.
 *
 * The TRANSPORT now lives in `lib/server/mail.ts` — signup needs to send a
 * verification link, and a second copy of "fetch Resend, check the status, log
 * the failure" is a second place to get it wrong. What stays here is what is
 * actually about enquiries: which address they land at, and what the message
 * looks like.
 *
 *   RESEND_API_KEY   — an API key from resend.com
 *   ENQUIRY_TO       — where enquiries land (defaults to hello@pixdevelop.com)
 *   ENQUIRY_FROM     — a verified sender on your own domain (falls back to MAIL_FROM)
 *
 * Set those and the form works. Leave them unset and the action returns
 * the failure copy, "email us at hello@pixdevelop.com", which the form shows
 * beside the same address — the one outcome that never quietly drops a school.
 */

export async function deliverEnquiry(enquiry: Enquiry): Promise<boolean> {
  /*
    THE ENQUIRY ITSELF, in the log, before anything else.

    `sendMail` warns when there is no transport, but it can only name what it
    knows — our own address and a subject line. On a server with no transport
    this warning is the ONLY record that a particular person tried to get in
    touch, and their address is the part that makes it actionable. Losing that
    was the one regression in moving the transport out, so it is written here,
    where the enquiry actually is.
  */
  if (!mailConfigured(process.env.ENQUIRY_FROM)) {
    console.warn("[contact] no transport configured — enquiry not delivered", {
      name: enquiry.name,
      email: enquiry.email,
      school: enquiry.school,
      length: enquiry.message.length,
    });
    return false;
  }

  const rows = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["School", enquiry.school || "\u2014"],
  ]
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
    .join("");

  return sendMail({
    subsystem: "contact",
    // `ENQUIRY_FROM` first so a deployment that set only that keeps working
    // exactly as it did; `sendMail` falls back to `MAIL_FROM`.
    from: process.env.ENQUIRY_FROM,
    // Defaults to SUPPORT_EMAIL, which is hello@pixdevelop.com.
    to: process.env.ENQUIRY_TO?.trim() || SUPPORT_EMAIL,
    replyTo: enquiry.email,
    subject: `eSchool enquiry \u2014 ${enquiry.name}${enquiry.school ? ` (${enquiry.school})` : ""}`,
    html: `${rows}<hr /><p style="white-space:pre-wrap">${escapeHtml(enquiry.message)}</p>`,
  });
}
