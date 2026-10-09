import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Registers our token-named font sizes, radii and shadows so they don't get merged away as colors.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["page-title", "card-title", "body", "label", "caption"],
      radius: ["input", "card", "tile"],
      shadow: ["card", "raised", "overlay"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
