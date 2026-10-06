import { useMemo, useState } from "react";
import { stockColumns } from "./stock-columns";
import { useStock } from "./stock-api";
import { toStockLine } from "./stock-rows";
import { useItemLookups } from "./use-item-lookups";

export function useStockTab(branchId: string) {
  const query = useStock(branchId);
  const lookups = useItemLookups(branchId);
  const [lowOnly, setLowOnly] = useState(false);
  const columns = useMemo(() => stockColumns(), []);

  const lines = useMemo(
    () => (query.data ?? []).map((row) => toStockLine(row, lookups.byId)),
    [query.data, lookups.byId],
  );
  const lowCount = lines.filter((line) => line.low).length;

  return {
    query,
    columns,
    rows: lowOnly ? lines.filter((line) => line.low) : lines,
    total: lines.length,
    lowCount,
    lowOnly,
    setLowOnly,
  };
}
