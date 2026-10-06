import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { proofColumns } from "./proof-columns";
import { useProofs } from "./proofs-api";
import type { PaymentProof } from "./types";

type ProofFilters = { status?: string };

/** Verification queue: submitted proofs first. */
export function useProofsTab(branchId: string | null) {
  const can = useCan();
  const list = useListState<ProofFilters>({ status: "SUBMITTED" });
  const query = useProofs({ ...list.params, branchId }, !!branchId);
  const columns = useMemo(() => proofColumns(), []);
  const detail = useDialogState<PaymentProof>();

  return {
    list,
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    detail,
    canReview: can("fees.approve"),
  };
}
