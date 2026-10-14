/**
 * The sky across one school day: gold at the morning gate, pink by midday,
 * the brand purple in the afternoon and a deep night purple by 8:00 PM.
 * One stop per card in SCHOOL_DAY, in the same order.
 */
export const DAY_STOPS = [
  "#f5a524",
  "#fb8a3c",
  "#f472b6",
  "#ec4899",
  "#a78bfa",
  "#7b68ee",
  "#5b4bc7",
  "#2a1f6b",
] as const;

/** The whole day as one CSS gradient, morning on the left (or top). */
export function dayGradient(direction: "to right" | "to bottom" = "to right") {
  return `linear-gradient(${direction}, ${DAY_STOPS.join(", ")})`;
}

export function stopFor(index: number) {
  return DAY_STOPS[Math.min(index, DAY_STOPS.length - 1)];
}
