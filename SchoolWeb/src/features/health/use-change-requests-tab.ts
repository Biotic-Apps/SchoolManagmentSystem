import { useMemo } from "react";
import { useApprovals } from "@/features/approvals/api";
import type { ApprovalRequest } from "@/features/approvals/types";
import { changeRequestColumns } from "./change-request-columns";

const PARAMS = { type: "CONTACT_CHANGE", status: "PENDING", entityType: "HEALTH", page: 1, pageSize: 100 };

function isHealthRequest(request: ApprovalRequest): boolean {
  return request.entityType === "HEALTH" || request.payload?.entityType === "HEALTH";
}

/** Parent health-record change requests: CONTACT_CHANGE approvals on a HEALTH entity. */
export function useChangeRequestsTab() {
  const query = useApprovals(PARAMS);
  const rows = useMemo(() => query.data?.data.filter(isHealthRequest), [query.data]);
  const columns = useMemo(() => changeRequestColumns(), []);
  return { query, rows, columns };
}
