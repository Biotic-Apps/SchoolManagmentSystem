import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useChildLinkRequests, useDecideChildLink } from "./child-links-api";
import { linkRequestColumns } from "./link-request-columns";
import type { ChildLinkRequest } from "./types";

/** Parent-initiated child links (OTP verified) awaiting the school's decision. */
export function useLinkRequestsTab(branchId: string) {
  const can = useCan();
  const list = useListState({});
  const query = useChildLinkRequests({ ...list.params, status: "REQUESTED", branchId });
  const approveTarget = useDialogState<ChildLinkRequest>();
  const rejectTarget = useDialogState<ChildLinkRequest>();
  const decide = useDecideChildLink();
  const canDecide = can("guardians.edit");

  const { reset } = decide;
  const { show: showApprove } = approveTarget;
  const { show: showReject } = rejectTarget;
  const columns = useMemo(
    () =>
      linkRequestColumns({
        onApprove: canDecide
          ? (item) => {
              reset();
              showApprove(item);
            }
          : undefined,
        onReject: canDecide
          ? (item) => {
              reset();
              showReject(item);
            }
          : undefined,
      }),
    [canDecide, reset, showApprove, showReject],
  );

  const approve = () => {
    const item = approveTarget.item;
    if (item) decide.mutate({ id: item.id, action: "approve" }, { onSuccess: approveTarget.close });
  };

  const reject = (reason: string) => {
    const item = rejectTarget.item;
    if (item) decide.mutate({ id: item.id, action: "reject", reason }, { onSuccess: rejectTarget.close });
  };

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    approveTarget,
    rejectTarget,
    approve,
    reject,
    deciding: decide.isPending,
    error: decide.error ? errorMessage(decide.error) : null,
  };
}
