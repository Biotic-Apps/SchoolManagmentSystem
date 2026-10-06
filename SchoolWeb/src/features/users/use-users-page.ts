import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { ROLE_KEYS, roleLabel } from "@/config/roles";
import { useCan, useCurrentUserId } from "@/features/auth/use-can";
import { useActiveBranches } from "@/features/branches/api";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useUnlockUser, useUsers } from "./api";
import type { CreatedUser, UserSummary } from "./types";
import { userColumns } from "./user-columns";

const ROLE_FILTER_OPTIONS: Option[] = ROLE_KEYS.filter((key) => key !== "PARENT").map((key) => ({
  id: key,
  name: roleLabel(key),
}));

interface RevealedPassword {
  title: string;
  password: string;
}

export function useUsersPage() {
  const can = useCan();
  const currentUserId = useCurrentUserId();
  const list = useListState<{ role?: string; branchId?: string; status?: string }>({
    role: undefined,
    branchId: undefined,
    status: undefined,
  });
  const query = useUsers(list.params);
  const { branches } = useActiveBranches();
  const create = useDialogState<true>();
  const edit = useDialogState<UserSummary>();
  const statusTarget = useDialogState<UserSummary>();
  const resetTarget = useDialogState<UserSummary>();
  const detail = useDialogState<UserSummary>();
  const unlockTarget = useDialogState<UserSummary>();
  const unlock = useUnlockUser();
  const [revealed, setRevealed] = useState<RevealedPassword | null>(null);

  const canEdit = can("users.edit");
  const columns = useMemo(
    () =>
      userColumns({
        onView: detail.show,
        onEdit: canEdit ? edit.show : undefined,
        onToggleStatus: canEdit ? statusTarget.show : undefined,
        onResetPassword: canEdit ? resetTarget.show : undefined,
        onUnlock: canEdit ? unlockTarget.show : undefined,
        currentUserId,
      }),
    [detail.show, edit.show, statusTarget.show, resetTarget.show, unlockTarget.show, canEdit, currentUserId],
  );

  const onCreated = (user: CreatedUser) => {
    create.close();
    if (user.temporaryPassword) setRevealed({ title: `Temporary password for ${user.name}`, password: user.temporaryPassword });
  };

  const onPasswordReset = (password: string) =>
    setRevealed({ title: `New temporary password for ${resetTarget.item?.name ?? "user"}`, password });

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canAdd: can("users.add"),
    roleOptions: ROLE_FILTER_OPTIONS,
    branchOptions: branches.map((branch) => ({ id: branch.id, name: branch.name })),
    create,
    edit,
    statusTarget,
    resetTarget,
    detail,
    unlockTarget,
    unlocking: unlock.isPending,
    confirmUnlock: () => {
      if (unlockTarget.item) unlock.mutate(unlockTarget.item.id, { onSuccess: unlockTarget.close });
    },
    revealed,
    clearRevealed: () => setRevealed(null),
    onCreated,
    onPasswordReset,
  };
}
