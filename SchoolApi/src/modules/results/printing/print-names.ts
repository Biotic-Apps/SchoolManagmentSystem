/** File-name safe text: "Class 5 / A" → "class-5-a". */
export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** "2026-10-09" in the school's calendar sense (UTC date of now). */
export const today = () => new Date().toISOString().slice(0, 10);
