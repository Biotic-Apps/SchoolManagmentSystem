"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { MODULES, MODULES_COPY } from "@/lib/site/content";
import { refreshScrollTriggers } from "@/lib/site/scroll";
import { ModuleCard } from "@/components/site/modules/ModuleCard";
import { RoleFilter, type RoleFilterId } from "@/components/site/modules/RoleFilter";
import { useSpotlight } from "@/components/site/modules/useSpotlight";
import { wideIndexes } from "@/components/site/modules/bento";

function matches(filter: RoleFilterId, roles: readonly string[]) {
  return filter === "all" || roles.includes(filter);
}

/**
 * Role chips over a bento of module cards. Changing the chip reflows the grid
 * with Framer's layout animation: cards that stay glide to their new cell,
 * cards that leave shrink out, cards that join bloom in.
 */
export function ModuleExplorer() {
  const [filter, setFilter] = useState<RoleFilterId>("all");
  const { onPointerMove } = useSpotlight<HTMLDivElement>();

  const counts = useMemo(() => {
    const out = {} as Record<RoleFilterId, number>;
    for (const f of MODULES_COPY.filters) {
      out[f.id] = MODULES.filter((m) => matches(f.id, m.roles)).length;
    }
    return out;
  }, []);

  const visible = useMemo(() => MODULES.filter((m) => matches(filter, m.roles)), [filter]);
  const wide = useMemo(() => wideIndexes(visible.length), [visible.length]);

  // The page just changed height; scroll-driven sections below re-measure.
  useEffect(() => {
    const id = window.setTimeout(refreshScrollTriggers, 700);
    return () => window.clearTimeout(id);
  }, [filter]);

  return (
    <div className="mt-10">
      <RoleFilter value={filter} counts={counts} onChange={setFilter} />
      <p className="sr-only" aria-live="polite">
        {`${visible.length} ${MODULES_COPY.shown}`}
      </p>

      <LayoutGroup>
        <div
          onPointerMove={onPointerMove}
          className="group/grid mt-8 grid grid-flow-row-dense gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((entry, index) => (
              <ModuleCard key={entry.name} entry={entry} wide={wide.has(index)} />
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
