import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { EMPTY_VALUE } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { formatMarks } from "../../options";
import type { StudentResult } from "../../types";
import { PassBadge } from "./PassBadge";

/** Per-subject marks of one result with the total row. */
export function SubjectMarksTable({ result }: { result: StudentResult }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Subject</TableHead>
            <TableHead className={NUMERIC_COLUMN}>Marks</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(result.subjects ?? []).map((subject) => (
            <TableRow key={subject.subjectId} className="hover:bg-transparent">
              <TableCell className="font-medium">{subject.name}</TableCell>
              <TableCell className={NUMERIC_COLUMN}>
                {subject.absent ? (
                  <Badge tone="warning">Absent</Badge>
                ) : (
                  `${formatMarks(subject.marks)} / ${formatMarks(subject.maxMarks)}`
                )}
              </TableCell>
              <TableCell>{subject.grade ?? EMPTY_VALUE}</TableCell>
              <TableCell>
                <PassBadge passed={subject.passed} />
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-background/60 hover:bg-background/60">
            <TableCell className="font-semibold">Total</TableCell>
            <TableCell className={`${NUMERIC_COLUMN} font-semibold`}>
              {formatMarks(result.totalMarks)} / {formatMarks(result.maxTotal)}
            </TableCell>
            <TableCell className="font-semibold">{result.grade ?? EMPTY_VALUE}</TableCell>
            <TableCell>
              <PassBadge passed={result.passed} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
