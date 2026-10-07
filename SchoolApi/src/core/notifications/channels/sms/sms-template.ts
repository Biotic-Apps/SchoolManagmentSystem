export type TemplateValues = Record<'to' | 'message' | 'senderId', string>;

type Escape = (value: string) => string;

/** JSON string content without the surrounding quotes. */
export const jsonEscape: Escape = (value) => JSON.stringify(value).slice(1, -1);

/** Replaces `{{to}}`, `{{message}}`, `{{senderId}}` (unknown names stay). */
export function fillTemplate(
  template: string,
  values: TemplateValues,
  escape: Escape,
): string {
  return template.replace(/\{\{\s*(to|message|senderId)\s*\}\}/g, (_, key) =>
    escape(values[key as keyof TemplateValues]),
  );
}

/** Escaping that matches the body's Content-Type. */
export function escapeFor(contentType: string | undefined): Escape {
  const type = contentType?.toLowerCase() ?? '';
  if (type.includes('json')) return jsonEscape;
  if (type.includes('x-www-form-urlencoded')) return encodeURIComponent;
  return (value) => value;
}
