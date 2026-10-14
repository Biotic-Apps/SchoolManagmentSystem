/** Drifting purple and pink mesh with a fading grid over it. Decorative only. */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-mesh">
        <span className="hero-mesh__blob hero-mesh__blob--a" />
        <span className="hero-mesh__blob hero-mesh__blob--b" />
        <span className="hero-mesh__blob hero-mesh__blob--c" />
      </div>
      <div className="hero-grid" />
      {/* Settles the mesh into the next section instead of ending on a hard edge. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-surface" />
    </div>
  );
}
