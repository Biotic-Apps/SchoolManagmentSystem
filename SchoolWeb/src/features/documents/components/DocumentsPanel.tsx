"use client";

import { Upload } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { docTypeLabel } from "../options";
import type { DocumentOwnerType } from "../types";
import { useDocumentsPanel } from "../use-documents-panel";
import { DocumentUploadDialog } from "./DocumentUploadDialog";

interface DocumentsPanelProps {
  ownerType: DocumentOwnerType;
  ownerId: string;
  title?: string;
  readOnly?: boolean;
}

/** Documents of one student, staff member, guardian or application: list, upload, verify/reject. */
export function DocumentsPanel({ ownerType, ownerId, title = "Documents", readOnly }: DocumentsPanelProps) {
  const panel = useDocumentsPanel({ ownerType, ownerId, readOnly });
  const verifyDoc = panel.verifyTarget.item;
  const rejectDoc = panel.rejectTarget.item;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        title={title}
        actions={
          panel.canUpload && (
            <Button variant="secondary" size="sm" onClick={() => panel.upload.show(true)}>
              <Upload />
              Upload
            </Button>
          )
        }
      />
      <DataTable
        columns={panel.columns}
        rows={panel.rows}
        getRowId={(row) => row.id}
        loading={panel.query.isLoading}
        error={panel.query.error}
        onRetry={() => panel.query.refetch()}
        skeletonRows={2}
        emptyTitle="No documents yet"
        emptyDescription={panel.canUpload ? "Upload birth certificate, B-Form, CNIC or other records." : undefined}
      />
      {panel.upload.open && <DocumentUploadDialog ownerType={ownerType} ownerId={ownerId} onClose={panel.upload.close} />}
      {verifyDoc && (
        <ReasonDialog
          open
          onOpenChange={panel.verifyTarget.onOpenChange}
          title={`Verify ${docTypeLabel(verifyDoc.docType)}?`}
          description="Confirm the document matches the original."
          label="Note"
          required={false}
          submitLabel="Verify"
          submitting={panel.verifying}
          onSubmit={panel.confirmVerify}
        />
      )}
      {rejectDoc && (
        <ReasonDialog
          open
          onOpenChange={panel.rejectTarget.onOpenChange}
          title={`Reject ${docTypeLabel(rejectDoc.docType)}?`}
          description="The uploader sees the reason and can upload a new file."
          submitLabel="Reject"
          submitting={panel.rejecting}
          error={panel.rejectError}
          onSubmit={panel.confirmReject}
        />
      )}
    </section>
  );
}
