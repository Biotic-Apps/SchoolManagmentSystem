"use client";

import { Fragment } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { fieldError } from "@/components/shared/form/field-error";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { BandCoverage } from "../../grade-bands";

interface BandTableEditorProps {
  rowIds: string[];
  coverage: BandCoverage;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const COLUMNS = [
  { key: "grade", label: "Grade", className: "min-w-20", inputMode: undefined },
  { key: "minPercent", label: "Min %", className: `min-w-20 ${NUMERIC_COLUMN}`, inputMode: "numeric" },
  { key: "maxPercent", label: "Max %", className: `min-w-20 ${NUMERIC_COLUMN}`, inputMode: "numeric" },
  { key: "remark", label: "Remark", className: "min-w-36", inputMode: undefined },
  { key: "gradePoint", label: "Grade point", className: `min-w-24 ${NUMERIC_COLUMN}`, inputMode: "decimal" },
] as const;

/** Grade bands, highest first; problems show under the row they belong to. */
export function BandTableEditor({ rowIds, coverage, onAdd, onRemove }: BandTableEditorProps) {
  const { register, formState } = useFormContext();
  const bandsError = fieldError(formState.errors, "bands") as { message?: string; root?: { message?: string } } | undefined;
  const listError = bandsError?.message ?? bandsError?.root?.message;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {COLUMNS.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-12">
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowIds.map((id, index) => {
              const errorOf = (key: string) => fieldError(formState.errors, `bands.${index}.${key}`)?.message;
              const issue = [
                coverage.rows[index],
                ...COLUMNS.map((column) => errorOf(column.key) && `${column.label}: ${errorOf(column.key)}`),
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <Fragment key={id}>
                  <TableRow className={issue ? "border-b-0 hover:bg-transparent" : "hover:bg-transparent"}>
                    {COLUMNS.map((column) => (
                      <TableCell key={column.key} className="px-2 py-2">
                        <Input
                          aria-label={`${column.label}, band ${index + 1}`}
                          inputMode={column.inputMode}
                          aria-invalid={!!errorOf(column.key) || (!!coverage.rows[index] && column.key.endsWith("Percent"))}
                          className={column.inputMode ? "text-right tabular-nums" : undefined}
                          {...register(`bands.${index}.${column.key}`)}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove band ${index + 1}`}
                        onClick={() => onRemove(index)}
                        disabled={rowIds.length === 1}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {issue && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS.length + 1} className="px-2 pb-2 pt-0">
                        <p role="alert" className="text-caption text-error">
                          {issue}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {coverage.general && <InlineNotice tone="error">{coverage.general}</InlineNotice>}
      {!coverage.general && listError && <p className="text-caption text-error">{listError}</p>}
      <Button variant="secondary" onClick={onAdd} className="self-start">
        <Plus />
        Add band
      </Button>
    </div>
  );
}
