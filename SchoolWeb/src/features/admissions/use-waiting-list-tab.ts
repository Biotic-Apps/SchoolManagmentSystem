import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import type { AcademicScope } from "@/features/classes/use-academic-scope";
import { DEFAULT_PAGE_SIZE } from "@/lib/use-list-state";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useOfferFromWaitingList, useWaitingList } from "./api";
import type { Application } from "./types";
import { waitingListColumns } from "./waiting-list-columns";

/** WAITLISTED applications of the scope, in the order the server keeps (waitlistPosition). */
export function useWaitingListTab(scope: AcademicScope) {
  const can = useCan();
  const [page, setPage] = useState(1);
  const { branchId, sessionId, classId } = scope;
  const query = useWaitingList(
    { page, pageSize: DEFAULT_PAGE_SIZE, branchId, sessionId, classId },
    !!branchId && !!sessionId,
  );
  const offerTarget = useDialogState<Application>();
  const offer = useOfferFromWaitingList();
  const canOffer = can("admissions.approve");

  const columns = useMemo(
    () => waitingListColumns({ onOffer: canOffer ? offerTarget.show : undefined }),
    [canOffer, offerTarget.show],
  );

  const rows = useMemo(
    () => [...(query.data?.data ?? [])].sort((a, b) => (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0)),
    [query.data],
  );

  const confirmOffer = () => {
    if (offerTarget.item) offer.mutate(offerTarget.item.id, { onSuccess: offerTarget.close });
  };

  return {
    query,
    rows: query.data ? rows : undefined,
    pagination: paginationFrom(query.data?.meta, setPage),
    columns,
    offerTarget,
    confirmOffer,
    offering: offer.isPending,
  };
}
