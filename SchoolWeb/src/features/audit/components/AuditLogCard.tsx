"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EMPTY_VALUE, formatDateTime, humanize } from "@/lib/format";
import { toTimelineEntry } from "../entry";
import type { AuditLog } from "../types";
import { AUDIT_AREA_OPTIONS, useAuditListPage } from "../use-audit-list";

const noLookup = () => undefined;

const COLUMNS: DataTableColumn<AuditLog>[] = [
  { id: "at", header: "When", cell: (log) => formatDateTime(log.at), className: "whitespace-nowrap" },
  { id: "actor", header: "Who", cell: (log) => log.actor?.name || "System" },
  {
    id: "action",
    header: "What",
    cell: (log) => (
      <div className="flex flex-col gap-0.5">
        <span>{toTimelineEntry(log, noLookup).title}</span>
        <span className="font-mono text-caption text-fg-muted">{log.action}</span>
      </div>
    ),
  },
  { id: "entity", header: "Record", cell: (log) => humanize(log.entityType) },
  { id: "ip", header: "IP address", cell: (log) => log.ip || EMPTY_VALUE, className: "whitespace-nowrap font-mono text-caption" },
];

/** System audit log: who did what and when, filterable by person, area and date (docs/deployment.md incident steps). */
export function AuditLogCard() {
  const page = useAuditListPage();
  const { filters, setFilter, reset } = page.list;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <CardDescription>Every recorded change and sign-in event in your scope, newest first.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FilterBar onReset={page.isFiltered ? reset : undefined}>
          {page.userOptions.length > 0 && (
            <FilterSelect
              label="Person"
              allLabel="Everyone"
              options={page.userOptions}
              value={filters.actorId}
              onChange={(value) => setFilter("actorId", value)}
              className="md:w-64"
            />
          )}
          <FilterSelect
            label="Area"
            allLabel="All areas"
            options={AUDIT_AREA_OPTIONS}
            value={filters.action}
            onChange={(value) => setFilter("action", value)}
          />
          <Input
            type="date"
            aria-label="From date"
            value={filters.from ?? ""}
            max={filters.to}
            onChange={(event) => setFilter("from", event.target.value || undefined)}
            className="md:w-44"
          />
          <Input
            type="date"
            aria-label="To date"
            value={filters.to ?? ""}
            min={filters.from}
            onChange={(event) => setFilter("to", event.target.value || undefined)}
            className="md:w-44"
          />
        </FilterBar>
        <DataTable
          columns={COLUMNS}
          rows={page.rows}
          getRowId={(log) => log.id}
          loading={page.query.isLoading}
          refreshing={page.query.isFetching}
          error={page.query.error}
          onRetry={() => void page.query.refetch()}
          emptyTitle={page.isFiltered ? "No entries match these filters" : "No audit entries yet"}
          pagination={page.pagination}
        />
      </CardContent>
    </Card>
  );
}
