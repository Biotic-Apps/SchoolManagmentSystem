import type { CSSProperties } from "react";
import type { FeatureModule } from "./featureGroups";

/** One module tile: icon, title, one-line benefit. Rises in with a stagger when the panel switches. */
export function FeatureCard({ module, index }: { module: FeatureModule; index: number }) {
  const Icon = module.icon;
  return (
    <li
      className="group flex gap-3.5 rounded-card border border-border bg-white p-4 shadow-card transition-[transform,box-shadow,border-color] duration-(--dur-standard) ease-standard hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-card-hover"
      style={{ animation: "rise-in 480ms var(--motion-ease-decelerate) backwards", animationDelay: `${80 + index * 45}ms` } as CSSProperties}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-selected text-primary transition-colors duration-(--dur-standard) group-hover:bg-primary group-hover:text-white">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <h4 className="text-label font-semibold text-fg">{module.title}</h4>
        <p className="mt-0.5 text-caption text-fg-muted">{module.benefit}</p>
      </div>
    </li>
  );
}
