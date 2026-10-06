"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useReportsPage } from "../use-reports-page";
import { RecentExports } from "./RecentExports";
import { ReportCatalog } from "./ReportCatalog";
import { ReportFormDialog } from "./ReportFormDialog";

export function ReportsPage() {
  const page = useReportsPage();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports & History"
        description="Pick a report, set its filters and download it as PDF, Excel or CSV."
      />
      <RecentExports exports={page.recent} />
      <ReportCatalog query={page.catalog} groups={page.groups} onSelect={page.select} />
      {page.selected && <ReportFormDialog key={page.selected.key} report={page.selected} onClose={page.closeForm} />}
    </div>
  );
}
