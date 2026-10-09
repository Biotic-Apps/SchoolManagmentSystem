"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { LEVEL_PRESETS, presetFor } from "@/features/classes/level-presets";
import { presetSubjects } from "../class-rows";
import type { SetupFormValues } from "../schemas";

/** Classes × subjects: tick what each class studies and set periods per week; presets per level. */
export function SubjectMatrix({ focusClass }: { focusClass: number | null }) {
  const { control, setValue, getValues } = useFormContext<SetupFormValues>();
  const classes = useWatch({ control, name: "academics.classes" });
  const columns = useWatch({ control, name: "academics.subjectNames" });
  const [newSubject, setNewSubject] = useState("");
  const included = classes.map((row, index) => ({ row, index })).filter(({ row }) => row.include);

  const setSubjects = (index: number, subjects: SetupFormValues["academics"]["classes"][number]["subjects"]) =>
    setValue(`academics.classes.${index}.subjects`, subjects, { shouldDirty: true });

  const toggle = (index: number, name: string) => {
    const subjects = getValues(`academics.classes.${index}.subjects`);
    const has = subjects.some((subject) => subject.name === name);
    const level = getValues(`academics.classes.${index}.level`);
    const preset = presetFor(level)?.subjects.find((subject) => subject.name === name);
    setSubjects(
      index,
      has ? subjects.filter((subject) => subject.name !== name) : [...subjects, { name, periodsPerWeek: preset?.periodsPerWeek ?? 4, group: preset?.group ?? "" }],
    );
  };
  const setPeriods = (index: number, name: string, value: string) => {
    const periods = Math.max(0, Math.min(20, Number(value.replace(/\D/g, "")) || 0));
    setSubjects(index, getValues(`academics.classes.${index}.subjects`).map((s) => (s.name === name ? { ...s, periodsPerWeek: periods } : s)));
  };
  const applyPreset = (level: string) =>
    included.filter(({ row }) => row.level === level).forEach(({ index }) => setSubjects(index, presetSubjects(row(index).level)));
  const row = (index: number) => getValues(`academics.classes.${index}`);
  const addColumn = () => {
    const name = newSubject.trim();
    if (!name || columns.some((column) => column.toLowerCase() === name.toLowerCase())) return;
    setValue("academics.subjectNames", [...columns, name], { shouldDirty: true });
    setNewSubject("");
  };

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface shadow-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-label font-semibold text-fg">Subjects per class</span>
        {LEVEL_PRESETS.filter((preset) => included.some(({ row: item }) => item.level === preset.key)).map((preset) => (
          <Button key={preset.key} variant="ghost" size="sm" onClick={() => applyPreset(preset.key)}>
            Use {preset.label} preset
          </Button>
        ))}
      </div>
      <div className="max-h-[60vh] overflow-auto rounded-input border border-border">
        <table className="border-collapse text-label">
          <thead className="sticky top-0 z-20 bg-background">
            <tr>
              <th className="sticky left-0 z-30 bg-background px-3 py-2 text-left text-caption font-semibold text-fg-muted">Class</th>
              {columns.map((name) => (
                <th key={name} className="min-w-24 px-2 py-2 text-left text-caption font-semibold text-fg-muted">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {included.map(({ row: item, index }) => (
              <tr key={index} className={index === focusClass ? "bg-selected/50" : "border-t border-border"}>
                <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-surface px-3 py-1.5 text-left font-medium text-fg">
                  {item.name}
                </th>
                {columns.map((name) => {
                  const cell = item.subjects.find((subject) => subject.name === name);
                  return (
                    <td key={name} className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Checkbox checked={!!cell} onCheckedChange={() => toggle(index, name)} aria-label={`${item.name} studies ${name}`} />
                        {cell && (
                          <Input
                            value={String(cell.periodsPerWeek)}
                            onChange={(event) => setPeriods(index, name, event.target.value)}
                            inputMode="numeric"
                            aria-label={`${name} periods per week in ${item.name}`}
                            className="h-7 w-10 px-1 text-center text-caption"
                          />
                        )}
                        {cell?.group && <span className="text-caption text-fg-muted">{cell.group}</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Input
          value={newSubject}
          onChange={(event) => setNewSubject(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addColumn();
            }
          }}
          placeholder="Another subject, e.g. Arabic"
          aria-label="New subject name"
          className="h-10 max-w-64"
        />
        <Button variant="secondary" onClick={addColumn}>
          <Plus />
          Add subject
        </Button>
      </div>
      <p className="text-caption text-fg-muted">The number next to a tick is periods per week.</p>
    </div>
  );
}
