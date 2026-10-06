import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useDepartures } from "./api";
import { departureColumns } from "./departure-columns";

export function useDeparturesTab(branchId: string, date: string) {
  const can = useCan();
  const query = useDepartures(branchId, date);
  const [recording, setRecording] = useState(false);
  const columns = useMemo(() => departureColumns(), []);
  return { query, columns, canRecord: can("pickup.edit"), recording, setRecording };
}
