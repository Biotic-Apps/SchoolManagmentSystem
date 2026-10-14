/**
 * Joins class names, dropping anything falsy.
 *
 * **This is deliberately NOT `cn` from `@/lib/utils`, and the two must not be
 * merged.** That one is `clsx` + `tailwind-merge`; twMerge DEDUPES conflicting
 * utilities, so of `"px-4"` and a caller's `"px-2"` it keeps the last one and
 * drops the other. This one keeps both and lets the CSS cascade decide, which
 * comes down to the order Tailwind happened to emit the two classes in.
 *
 * Every marketing component was written and visually checked against a plain
 * joiner. Pointing them at twMerge would change which of two competing classes
 * wins on any element that has a pair — silently, with no type error and no
 * build failure, on a page nobody would think to re-check. The app keeps its
 * merging `cn`; the site keeps this one. Two functions with one name is a small
 * cost next to a layout that shifts for reasons nothing records.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
