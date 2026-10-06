"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { DocumentsPanel } from "@/features/documents/components/DocumentsPanel";
import { useApplicationDetail } from "../use-application-detail";
import { ApplicationActions } from "./ApplicationActions";
import { ApplicationDialogs } from "./ApplicationDialogs";
import { ApplicationGuardians } from "./ApplicationGuardians";
import { ApplicationProfile } from "./ApplicationProfile";
import { ApplicationTestBlock } from "./ApplicationTestBlock";
import { StudentProfileLink } from "./StudentProfileLink";

interface ApplicationDetailDrawerProps {
  applicationId: string | null;
  classOptions: Option[];
  onClose: () => void;
}

export function ApplicationDetailDrawer({ applicationId, classOptions, onClose }: ApplicationDetailDrawerProps) {
  const detail = useApplicationDetail(applicationId);
  const { app, query } = detail;

  return (
    <DetailDrawer
      open={!!applicationId}
      onOpenChange={(open) => {
        if (open) return;
        detail.closeDialog();
        onClose();
      }}
      title={detail.title}
      description={
        app && (
          <span className="flex flex-wrap items-center gap-2">
            {app.applicationNo}
            <StatusBadge status={app.status} />
          </span>
        )
      }
      actions={
        app && (
          <>
            <ApplicationActions actions={detail.actions} hasTest={!!app.test} onOpen={detail.open} />
            {app.studentId && <StudentProfileLink studentId={app.studentId} />}
          </>
        )
      }
    >
      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {app && detail.stepper && (
        <>
          <StatusStepper
            steps={detail.stepper.steps}
            current={detail.stepper.current}
            failedLabel={detail.stepper.failedLabel}
          />
          <ApplicationProfile app={app} />
          <ApplicationGuardians guardians={app.guardians} />
          <ApplicationTestBlock test={app.test} />
          <DocumentsPanel ownerType="APPLICATION" ownerId={app.id} readOnly={detail.documentsReadOnly} />
          <ApplicationDialogs
            app={app}
            active={detail.active}
            classOptions={classOptions}
            onClose={detail.closeDialog}
            withdraw={{ submitting: detail.withdrawing, error: detail.withdrawError, onSubmit: detail.confirmWithdraw }}
          />
        </>
      )}
    </DetailDrawer>
  );
}
