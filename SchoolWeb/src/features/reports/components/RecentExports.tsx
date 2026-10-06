import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RecentExport } from "../types";
import { RecentExportRow } from "./RecentExportRow";

/** Exports started in this browser tab; nothing is kept after a reload. */
export function RecentExports({ exports }: { exports: RecentExport[] }) {
  if (!exports.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent exports</CardTitle>
        <CardDescription>Started in this browser session. Download links stay here until you reload.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y divide-border">
          {exports.map((item) => (
            <RecentExportRow key={item.jobId} item={item} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
