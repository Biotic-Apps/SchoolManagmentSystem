import { useMemo, useState } from "react";
import { useCan } from "@/features/auth/use-can";
import type { AcademicScope } from "@/features/classes/use-academic-scope";
import { DEFAULT_PAGE_SIZE } from "@/lib/use-list-state";
import { localPage } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useOfferFromWaitingList, useWaitingList } from "./api";
import type { Application } from "./types";
import { waitingListColumns } from "./waiting-list-columns";

/** WAITLISTED applications of the scope, in the order the server keeps (waitlistPosition).
 * The endpoint returns the full list, so it is paged here. */
export function useWaitingListTab(scope: AcademicScope) {
  const can = useCan();
  const [page, setPage] = useState(1);
  const { branchId, sessionId, classId } = scope;
  const query = useWaitingList({ branchId, sessionId, classId }, !!branchId && !!sessionId);
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
  const visible = localPage(query.data ? rows : undefined, page, DEFAULT_PAGE_SIZE, setPage);

  const confirmOffer = () => {
    if (offerTarget.item) offer.mutate(offerTarget.item.id, { onSuccess: offerTarget.close });
  };

  return {
    query,
    rows: visible.rows,
    pagination: visible.pagination,
    columns,
    offerTarget,
    confirmOffer,
    offering: offer.isPending,
  };
}
