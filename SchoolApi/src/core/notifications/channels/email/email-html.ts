import type { EmailExtras } from '../channel-message';

export interface EmailHtmlInput {
  schoolName: string;
  title: string;
  /** Plain text; blank lines start new paragraphs. */
  body: string;
  extras?: EmailExtras;
}

const PRIMARY = '#0B7F74';
const TEXT = '#1F2A2E';
const MUTED = '#5F6E72';

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c]!,
  );

const safeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : null);

function paragraphs(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:22px;color:${TEXT}">${escape(p).replace(/\n/g, '<br>')}</p>`,
    )
    .join('');
}

function codeBlock(extras: EmailExtras): string {
  if (!extras.code) return '';
  const note = extras.codeNote
    ? `<div style="margin-top:6px;font-size:13px;color:${MUTED}">${escape(extras.codeNote)}</div>`
    : '';
  return `<div style="margin:6px 0 20px;padding:18px;border-radius:12px;background:#EEF7F5;text-align:center">
<div style="font-family:'SFMono-Regular',Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:8px;color:${PRIMARY}">${escape(extras.code)}</div>${note}</div>`;
}

function button(extras: EmailExtras): string {
  const url = extras.action && safeUrl(extras.action.url);
  if (!extras.action || !url) return '';
  return `<p style="margin:4px 0 20px"><a href="${escape(url)}" style="display:inline-block;padding:12px 22px;border-radius:10px;background:${PRIMARY};color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none">${escape(extras.action.label)}</a></p>`;
}

/** Branded, inline-styled HTML part for every outgoing email (clients strip <style>). */
export function renderEmailHtml(input: EmailHtmlInput): string {
  const extras = input.extras ?? {};
  const school = escape(input.schoolName);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(input.title)}</title></head>
<body style="margin:0;padding:0;background:#F4F7F6;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #DCE8E5;border-radius:14px;overflow:hidden">
<tr><td style="background:${PRIMARY};padding:18px 24px;color:#FFFFFF;font-size:18px;font-weight:700">${school}</td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:28px;color:${TEXT}">${escape(input.title)}</h1>
${codeBlock(extras)}${paragraphs(input.body)}${button(extras)}
</td></tr>
<tr><td style="padding:14px 24px;border-top:1px solid #DCE8E5;font-size:12px;line-height:18px;color:${MUTED}">Sent by ${school} through eSchool. Never share sign-in codes or passwords with anyone, including school staff.</td></tr>
</table></td></tr></table></body></html>`;
}
