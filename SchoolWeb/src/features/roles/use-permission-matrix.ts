import { useMemo } from "react";
import { usePermissionCatalogue } from "./api";
import { buildPermissionMatrix } from "./permission-matrix";

export function usePermissionMatrix() {
  const query = usePermissionCatalogue();
  const matrix = useMemo(() => buildPermissionMatrix(query.data ?? []), [query.data]);
  return { matrix, total: query.data?.length ?? 0, query };
}
