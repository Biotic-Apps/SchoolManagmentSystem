"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useCertificatesPage } from "../use-certificates-page";
import { CertificateDetailDrawer } from "./CertificateDetailDrawer";
import { CertificateFilters } from "./CertificateFilters";
import { RequestCertificateDialog } from "./RequestCertificateDialog";

export function CertificatesRoute() {
  const page = useCertificatesPage();
  const { query } = page;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Certificates"
        description={
          page.isParent
            ? "Request certificates for your child and download them once issued."
            : "Leaving, transfer, character, attendance and achievement certificates: request, approve and issue."
        }
        actions={
          page.canRequest && (
            <Button onClick={() => page.setRequesting(true)}>
              <Plus />
              Request certificate
            </Button>
          )
        }
      />
      {page.isParent && !page.child ? (
        <NoChildState description="Once your child link is verified, you can request certificates here." />
      ) : (
        <div className="flex flex-col gap-4">
          <CertificateFilters page={page} />
          <DataTable
            columns={page.columns}
            rows={page.rows}
            getRowId={(row) => row.id}
            loading={query.isLoading || page.picker.isLoading}
            error={query.error ?? page.picker.error}
            onRetry={() => query.refetch()}
            onRowClick={(row) => page.openCertificate(row.id)}
            emptyTitle="No certificates"
            emptyDescription="Requested and issued certificates appear here."
            pagination={page.pagination}
          />
        </div>
      )}
      {page.requesting && (
        <RequestCertificateDialog
          onClose={() => page.setRequesting(false)}
          onSaved={(certificate) => {
            page.setRequesting(false);
            page.openCertificate(certificate.id);
          }}
        />
      )}
      <CertificateDetailDrawer certificate={page.open} onClose={page.closeCertificate} />
    </div>
  );
}
