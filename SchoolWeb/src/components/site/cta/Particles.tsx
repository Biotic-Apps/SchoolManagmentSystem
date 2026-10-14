/*
 * Fixed positions, not Math.random(): the band is server-rendered, and a
 * random layout would differ between the server and the browser.
 */
const DOTS = [
  [6, 18, 3, 8], [14, 72, 2, 11], [22, 36, 4, 9], [31, 84, 2, 13], [38, 12, 3, 10],
  [46, 58, 2, 12], [53, 26, 3, 8], [61, 78, 4, 14], [68, 40, 2, 9], [74, 14, 3, 12],
  [81, 66, 2, 10], [88, 30, 4, 13], [93, 82, 2, 9], [10, 50, 2, 12], [57, 90, 3, 11],
  [84, 48, 2, 8], [27, 60, 3, 14], [42, 92, 2, 10],
] as const;

/**
 * Small glowing points drifting on the band. Each reuses the site's
 * `float-sway` loop with its own length and phase, so the field never moves
 * in step; reduced motion parks them (site.css).
 */
export function Particles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {DOTS.map(([left, top, size, duration], index) => (
        <span
          key={`${left}-${top}`}
          className="float-sway absolute rounded-full bg-white shadow-[0_0_12px_2px_rgb(255_255_255/0.45)]"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            opacity: 0.25 + (index % 4) * 0.12,
            animationDuration: `${duration}s`,
            animationDelay: `${-index * 1.3}s`,
          }}
        />
      ))}
    </div>
  );
}
