import { useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { ImportPreviewRow } from "../../import-types";
import { previewColumns, type KeyedPreviewRow } from "../../preview-columns";

/** First parsed rows; the table scrolls sideways inside its own container. */
export function ImportPreviewTable({ preview }: { preview: ImportPreviewRow[] }) {
  const columns = useMemo(() => previewColumns(preview), [preview]);
  const rows: KeyedPreviewRow[] = useMemo(
    () => preview.map((values, index) => ({ key: String(index), values })),
    [preview],
  );
  if (preview.length === 0 || columns.length === 0) return null;

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <SectionHeading title={`Preview of the first ${preview.length} rows`} />
      <div className="min-w-0 max-w-full overflow-x-auto">
        <DataTable columns={columns} rows={rows} getRowId={(row) => row.key} />
      </div>
    </section>
  );
}
