import { useMemo, useState } from "react";
import { useActiveChild, useIsParent } from "@/features/auth/use-active-child";
import { useCan } from "@/features/auth/use-can";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { paginationFrom } from "@/lib/pagination";
import { useListState } from "@/lib/use-list-state";
import { useCertificates } from "./api";
import { certificateColumns } from "./certificate-columns";
import type { Certificate } from "./types";

type CertificateFilters = { type?: string; status?: string };

/** Staff list per branch; a parent sees the Topbar child's certificates only. */
export function useCertificatesPage() {
  const can = useCan();
  const isParent = useIsParent();
  const child = useActiveChild();
  const picker = useBranchPicker();
  const list = useListState<CertificateFilters>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const scopeParams = isParent ? { studentId: child?.id } : { branchId: picker.branchId };
  const enabled = isParent ? !!child : !!picker.branchId;
  const query = useCertificates({ ...list.params, ...scopeParams }, enabled);
  const columns = useMemo(() => certificateColumns({ showStudent: !isParent }), [isParent]);
  const rows = query.data?.data;

  return {
    isParent,
    child,
    picker,
    list,
    query,
    rows,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    waitingForScope: !enabled && !picker.isLoading,
    canRequest: isParent ? !!child : can("certificates.add"),
    requesting,
    setRequesting,
    open: (rows ?? []).find((item: Certificate) => item.id === openId) ?? null,
    openCertificate: setOpenId,
    closeCertificate: () => setOpenId(null),
  };
}

export type CertificatesPage = ReturnType<typeof useCertificatesPage>;
