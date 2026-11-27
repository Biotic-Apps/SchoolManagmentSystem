import { useMemo } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useCan } from "@/features/auth/use-can";
import { useUsers } from "@/features/users/api";
import { OPTIONS_PAGE } from "@/config/options";
import { paginationFrom } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { useAuditList } from "./api";

type AuditFilters = { actorId?: string; action?: string; from?: string; to?: string };

/** Areas of the audit log; a value ending in "." matches every action of that area. */
export const AUDIT_AREA_OPTIONS: Option[] = [
  { id: "auth.", name: "Sign-in & security" },
  { id: "user.", name: "Users" },
  { id: "role.", name: "Roles" },
  { id: "school.", name: "Schools" },
  { id: "branch.", name: "Branches" },
  { id: "settings.", name: "Settings" },
  { id: "backup.", name: "Backups" },
  { id: "student.", name: "Students" },
  { id: "staff.", name: "Staff" },
  { id: "payment.", name: "Payments" },
  { id: "invoice.", name: "Invoices" },
  { id: "exam.", name: "Exams" },
  { id: "file.", name: "Files" },
];

/** Filterable, paginated list of every audit entry in the viewer's scope. */
export function useAuditListPage() {
  const can = useCan();
  const list = useListState<AuditFilters>({});
  // GET /audit has no free-text search.
  const query = useAuditList({ ...list.params, search: undefined });
  const users = useUsers({ ...OPTIONS_PAGE }, can("users.view"));
  const userOptions: Option[] = useMemo(
    () =>
      (users.data?.data ?? []).map((user) => ({
        id: user.id,
        name: user.email ? `${user.name} (${user.email})` : user.name,
      })),
    [users.data],
  );

  return {
    list,
    query,
    userOptions,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    isFiltered: Object.values(list.filters).some(Boolean),
  };
}
