import { useMemo } from "react";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { failedNotificationColumns } from "./failed-notification-columns";
import { useFailedNotifications, useResendAllNotifications, useResendNotification } from "./support-api";
import type { FailedNotificationFilters } from "./support-types";

export function useSupportNotifications(schoolId: string, canEdit: boolean) {
  const list = useListState<FailedNotificationFilters>({});
  const { channel, from, to } = list.filters;
  const query = useFailedNotifications({ ...list.params, schoolId });
  const resend = useResendNotification();
  const resendAll = useResendAllNotifications();
  const confirmAll = useDialogState<true>();

  const rows = query.data?.rows;
  const meta = query.data?.meta;
  const total = meta?.total ?? rows?.length ?? 0;
  const resendingId = resend.isPending ? resend.variables : undefined;

  const columns = useMemo(
    () => failedNotificationColumns({ canEdit, onResend: (id) => resend.mutate(id), resendingId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate is stable
    [canEdit, resendingId],
  );

  const confirmResendAll = () =>
    resendAll.mutate({ schoolId, channel, from, to }, { onSuccess: () => confirmAll.close() });

  return {
    list,
    query,
    rows,
    columns,
    total,
    pagination: paginationFrom(meta, list.setPage),
    confirmAll,
    confirmResendAll,
    resendingAll: resendAll.isPending,
    canResendAll: canEdit && total > 0,
  };
}

export type SupportNotificationsState = ReturnType<typeof useSupportNotifications>;
