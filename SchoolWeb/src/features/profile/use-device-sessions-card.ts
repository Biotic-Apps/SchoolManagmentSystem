import { useMemo, useState } from "react";
import type { DeviceSession } from "@/features/auth/types";
import { useSession } from "@/features/auth/session-context";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDeviceSessions, useLogoutAll, useRevokeDeviceSession } from "./api";
import { deviceColumns } from "./device-columns";

export function useDeviceSessionsCard() {
  const { signOut } = useSession();
  const query = useDeviceSessions();
  const revoke = useRevokeDeviceSession();
  const logoutAll = useLogoutAll();
  const revokeTarget = useDialogState<DeviceSession>();
  const [confirmAll, setConfirmAll] = useState(false);

  const columns = useMemo(() => deviceColumns(revokeTarget.show), [revokeTarget.show]);

  const confirmRevoke = () => {
    if (revokeTarget.item) revoke.mutate(revokeTarget.item.id, { onSuccess: revokeTarget.close });
  };

  // logout-all also revokes this device, so end the local session (and the BFF cookie) right after.
  const confirmLogoutAll = () => logoutAll.mutate(undefined, { onSuccess: () => void signOut("signed-out") });

  return {
    query,
    rows: query.data,
    columns,
    revokeTarget,
    revoking: revoke.isPending,
    confirmRevoke,
    confirmAll,
    setConfirmAll,
    loggingOutAll: logoutAll.isPending,
    confirmLogoutAll,
  };
}
