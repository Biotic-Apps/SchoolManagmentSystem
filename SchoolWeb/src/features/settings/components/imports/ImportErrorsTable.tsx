import { useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { importErrorColumns, type KeyedImportError } from "../../import-error-columns";
import type { ImportRowError } from "../../import-types";

const ERROR_LIMIT = 500;

export function ImportErrorsTable({ errors }: { errors: ImportRowError[] }) {
  const rows: KeyedImportError[] = useMemo(
    () => errors.map((error, index) => ({ ...error, key: String(index) })),
    [errors],
  );
  if (errors.length === 0) return null;

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <SectionHeading title="Problems to fix" />
      {errors.length === ERROR_LIMIT && (
        <p className="text-caption text-fg-muted">Showing the first 500 problems.</p>
      )}
      <DataTable columns={importErrorColumns} rows={rows} getRowId={(row) => row.key} />
    </section>
  );
}
