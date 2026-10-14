import type { FeatureGroup } from "./featureGroups";
import { SpotlightVisual } from "./SpotlightVisual";

/** Big left-hand card for the active group: gradient icon, name, pitch and a small illustrative UI. */
export function FeatureSpotlight({ group }: { group: FeatureGroup }) {
  const Icon = group.icon;
  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-linear-to-br from-card-bg via-selected to-white p-6 shadow-card sm:p-7"
      style={{ animation: "rise-in 520ms var(--motion-ease-decelerate) backwards" }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />
      <span className="relative grid size-12 place-items-center rounded-tile bg-linear-to-br from-primary to-accent-pink text-white shadow-raised">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="relative mt-5 text-[22px] font-bold leading-tight tracking-tight text-fg">{group.label}</h3>
      <p className="relative mt-2 text-label text-fg-muted">{group.pitch}</p>
      <p className="relative mt-3 text-caption font-semibold text-on-selected">{group.modules.length} modules included</p>
      <div className="relative mt-6 flex-1" aria-hidden>
        <SpotlightVisual id={group.id} />
      </div>
    </article>
  );
}
