"use client";

import { LayoutGrid } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { useMyClassesPage } from "../use-my-classes-page";
import { SectionScopeBar } from "./SectionScopeBar";

export function MyClassesPage() {
  const page = useMyClassesPage();
  const { sectionScope, query } = page;
  const section = sectionScope.section;

  return (
    <>
      <PageHeader
        title="My Classes & Students"
        description="The sections you teach and their students. Open a student for profile, attendance and health notes."
      />
      <div className="flex flex-col gap-4">
        <SectionScopeBar scope={sectionScope} />
        {!sectionScope.isLoading && !sectionScope.sectionId ? (
          <Card>
            <EmptyState
              icon={LayoutGrid}
              title="No sections assigned"
              description="Sections appear here once you are assigned as class or subject teacher."
            />
          </Card>
        ) : (
          <>
            {section && (
              <p className="text-label text-fg-muted">
                {section.className} {section.name} · {page.total} students
              </p>
            )}
            <DataTable
              columns={page.columns}
              rows={page.rows}
              getRowId={(row) => row.id}
              loading={sectionScope.isLoading || query.isLoading}
              error={query.error}
              onRetry={() => query.refetch()}
              onRowClick={page.openStudent}
              emptyTitle="No students in this section"
              emptyDescription="Students appear here once they are enrolled in the section."
            />
          </>
        )}
      </div>
    </>
  );
}
