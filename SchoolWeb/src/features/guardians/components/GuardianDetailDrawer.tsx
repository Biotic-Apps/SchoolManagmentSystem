"use client";

import { KeyRound, Pencil } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { ErrorState } from "@/components/shared/ErrorState";
import { SecretRevealDialog } from "@/components/shared/SecretRevealDialog";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EntityHistory } from "@/features/audit/components/EntityHistory";
import { guardianItems } from "../guardian-items";
import { useGuardianDetail } from "../use-guardian-detail";
import { EditGuardianDialog } from "./EditGuardianDialog";
import { GuardianChildrenList } from "./GuardianChildrenList";
import { LinkChildDialog } from "./LinkChildDialog";
import { UnlinkDialog } from "./UnlinkDialog";

interface GuardianDetailDrawerProps {
  guardianId: string | null;
  branchId: string | null;
  onClose: () => void;
}

export function GuardianDetailDrawer({ guardianId, branchId, onClose }: GuardianDetailDrawerProps) {
  const detail = useGuardianDetail(guardianId);
  const { guardian, query, account } = detail;

  return (
    <>
      <DetailDrawer
        open={!!guardianId}
        onOpenChange={(open) => !open && onClose()}
        title={guardian?.name ?? "Guardian"}
        actions={
          guardian && (
            <>
              {detail.canEdit && (
                <Button variant="secondary" size="sm" onClick={() => detail.edit.show(true)}>
                  <Pencil />
                  Edit
                </Button>
              )}
              {detail.canCreateAccount && (
                <Button variant="secondary" size="sm" onClick={() => account.confirmTarget.show(guardian)}>
                  <KeyRound />
                  Create parent account
                </Button>
              )}
            </>
          )
        }
      >
        {query.isLoading && <Skeleton className="h-40 w-full" />}
        {query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {guardian && (
          <>
            <DetailList items={guardianItems(guardian)} />
            <GuardianChildrenList
              items={detail.children}
              onLink={detail.canLinkChild ? () => detail.linkChild.show(true) : undefined}
              onUnlink={detail.onUnlink}
            />
            <EntityHistory entityType="Guardian" entityId={guardian.id} />
          </>
        )}
      </DetailDrawer>
      {detail.edit.open && guardian && <EditGuardianDialog guardian={guardian} onClose={detail.edit.close} />}
      {detail.linkChild.open && guardian && (
        <LinkChildDialog guardian={guardian} branchId={branchId} onClose={detail.linkChild.close} />
      )}
      <UnlinkDialog unlink={detail.unlink} />
      <ConfirmDialog
        open={!!account.confirmTarget.item}
        onOpenChange={account.confirmTarget.onOpenChange}
        title={`Create a parent account for ${account.confirmTarget.item?.name ?? "this guardian"}?`}
        description="They sign in with their phone or email and a temporary password shown once."
        confirmLabel="Create account"
        loading={account.creating}
        onConfirm={account.confirm}
      />
      <SecretRevealDialog
        secret={account.revealed?.password ?? null}
        title={account.revealed?.title ?? ""}
        description={`Login: ${account.revealed?.login ?? ""}. Share the password privately; it is shown only once.`}
        onClose={account.clearRevealed}
      />
    </>
  );
}
