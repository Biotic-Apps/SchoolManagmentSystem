import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { Question } from "./types";
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from "./options";

const typeLabel = (t: string) => QUESTION_TYPE_OPTIONS.find((o) => o.id === t)?.name ?? t;
const diffLabel = (d: string) => DIFFICULTY_OPTIONS.find((o) => o.id === d)?.name ?? d;

export function questionColumns(): DataTableColumn<Question>[] {
  return [
    {
      id: "questionText",
      header: "Question",
      className: "min-w-52 max-w-xs",
      cell: (row) => (
        <span className="block truncate font-medium">
          {row.questionText.length > 80 ? `${row.questionText.slice(0, 80)}...` : row.questionText}
        </span>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      className: "whitespace-nowrap",
      cell: (row) => row.subject?.name ?? "-",
    },
    {
      id: "class",
      header: "Class",
      className: "whitespace-nowrap",
      cell: (row) => row.class?.name ?? "-",
    },
    {
      id: "chapterName",
      header: "Chapter",
      className: "min-w-32 max-w-48",
      cell: (row) => <span className="block truncate">{row.chapterName}</span>,
    },
    {
      id: "questionType",
      header: "Type",
      className: "whitespace-nowrap",
      cell: (row) => <Badge tone="neutral">{typeLabel(row.questionType)}</Badge>,
    },
    {
      id: "difficultyLevel",
      header: "Difficulty",
      className: "whitespace-nowrap",
      cell: (row) => <Badge tone={row.difficultyLevel === "HARD" ? "error" : row.difficultyLevel === "MEDIUM" ? "warning" : "success"}>{diffLabel(row.difficultyLevel)}</Badge>,
    },
    {
      id: "marks",
      header: "Marks",
      className: "whitespace-nowrap text-center",
      cell: (row) => String(row.marks),
    },
  ];
}
