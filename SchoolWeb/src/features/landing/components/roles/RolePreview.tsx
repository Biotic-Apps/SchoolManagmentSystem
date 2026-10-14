import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LandingRole } from "./roleData";

/** Fade/slide-in on mount via @starting-style; parent keys this by role id so each change animates. */
const enter = "transition-[opacity,translate] duration-500 ease-out starting:opacity-0 motion-safe:starting:translate-y-2";

/** "What <role> can do" checklist next to a tiny mock of that role's portal. */
export function RolePreview({ role }: { role: LandingRole }) {
  const Icon = role.icon;
  return (
    <div className="relative overflow-hidden rounded-card border border-border bg-white p-5 shadow-raised sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-card-bg/70 blur-3xl" aria-hidden />
      <div className={cn("relative flex items-center gap-3", enter)}>
        <span className="grid size-11 shrink-0 place-items-center rounded-tile bg-gradient-to-br from-primary to-[#A78BFA] text-white shadow-card">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-caption font-semibold uppercase tracking-[0.12em] text-primary">Portal</p>
          <h3 className="text-card-title font-bold text-fg">What {role.name.toLowerCase()} can do</h3>
        </div>
      </div>

      <div className="relative mt-6 grid gap-6 md:grid-cols-[1fr_minmax(0,230px)] md:items-start">
        <ul className="flex flex-col gap-3">
          {role.abilities.map((text, i) => (
            <li key={text} className={cn("flex items-start gap-3", enter)} style={{ transitionDelay: `${80 + i * 60}ms` }}>
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-selected text-primary ring-1 ring-inset ring-border">
                <Check className="size-3" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-label text-fg">{text}</span>
            </li>
          ))}
        </ul>
        <MockPortal role={role} />
      </div>
    </div>
  );
}

function MockPortal({ role }: { role: LandingRole }) {
  return (
    <div
      className={cn("overflow-hidden rounded-tile border border-border bg-[#F7F5FF] shadow-card", enter)}
      style={{ transitionDelay: "160ms" }}
      aria-hidden
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-white px-3 py-2">
        <span className="size-2 rounded-full bg-accent-pink/70" />
        <span className="size-2 rounded-full bg-[#FBBF24]/70" />
        <span className="size-2 rounded-full bg-primary/60" />
        <span className="ml-2 truncate text-[11px] font-medium text-fg-muted">eSchool · {role.name}</span>
      </div>
      <div className="flex gap-2 p-2">
        <ul className="flex w-[58%] flex-col gap-1">
          {role.menu.map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <li
                key={item.label}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium",
                  i === 0 ? "bg-primary text-white" : "text-on-selected",
                )}
              >
                <ItemIcon className="size-3 shrink-0" />
                <span className="truncate">{item.label}</span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-1 flex-col gap-1.5 rounded-md bg-white p-2">
          <span className="h-2 w-3/4 rounded-full bg-card-bg" />
          <span className="h-2 w-1/2 rounded-full bg-selected" />
          <div className="mt-1 flex h-12 items-end gap-1">
            {[55, 80, 40, 95, 65].map((h, i) => (
              <span key={i} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${h}%` }} />
            ))}
          </div>
          <span className="mt-1 h-2 w-2/3 rounded-full bg-selected" />
        </div>
      </div>
    </div>
  );
}
