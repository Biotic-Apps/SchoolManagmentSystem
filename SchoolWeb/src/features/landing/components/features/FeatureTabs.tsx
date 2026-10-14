"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { FeatureGroup, FeatureGroupId } from "./featureGroups";

interface FeatureTabsProps {
  groups: FeatureGroup[];
  active: FeatureGroupId;
  onChange: (id: FeatureGroupId) => void;
}

export const tabId = (id: FeatureGroupId) => `features-tab-${id}`;
export const panelId = (id: FeatureGroupId) => `features-panel-${id}`;

/** Pill tab bar with a sliding active indicator. Scrolls sideways on phones; arrow keys move focus + selection. */
export function FeatureTabs({ groups, active, onChange }: FeatureTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<FeatureGroupId, HTMLButtonElement>());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const tab = tabRefs.current.get(active);
      if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current.get(active);
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const select = (index: number) => {
    const group = groups[(index + groups.length) % groups.length];
    if (!group) return;
    onChange(group.id);
    tabRefs.current.get(group.id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = groups.findIndex((g) => g.id === active);
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: groups.length - 1 };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  return (
    <div className="flex justify-center">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Feature groups"
        onKeyDown={onKeyDown}
        className="relative flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-white p-1.5 shadow-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {indicator && (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-0 rounded-full bg-primary shadow-raised transition-[transform,width] duration-(--dur-slow) ease-standard"
            style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
          />
        )}
        {groups.map((group) => {
          const selected = group.id === active;
          const Icon = group.icon;
          return (
            <button
              key={group.id}
              ref={(node) => {
                if (node) tabRefs.current.set(group.id, node);
                else tabRefs.current.delete(group.id);
              }}
              id={tabId(group.id)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(group.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(group.id)}
              className={cn(
                "relative z-10 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-label font-semibold transition-colors duration-(--dur-standard)",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                selected ? "text-white" : "text-fg-muted hover:text-fg",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {group.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
