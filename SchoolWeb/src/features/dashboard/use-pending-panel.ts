import { useMemo } from "react";
import { navItem } from "@/config/navigation";
import { todayIso } from "@/lib/dates";
import { usePendingCounts } from "./api";
import { PENDING_TILES } from "./pending-definitions";
import { useMenuIds } from "./use-menu-ids";

/** Today's queues (principal / coordinator), each linking to the screen that clears it. */
export function usePendingPanel(branchId: string | null) {
  const menu = useMenuIds();
  const query = usePendingCounts(branchId, todayIso(), true);
  const counts = query.data;

  const tiles = useMemo(
    () =>
      PENDING_TILES.filter((tile) => menu.has(tile.link)).map((tile) => ({
        ...tile,
        count: counts?.[tile.key],
        href: navItem(tile.link).route,
      })),
    [menu, counts],
  );

  return { query, tiles };
}
