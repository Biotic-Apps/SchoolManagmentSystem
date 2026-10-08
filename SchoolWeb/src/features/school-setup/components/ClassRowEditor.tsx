"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ChipToggleGroup } from "@/components/shared/ChipToggleGroup";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { LEVEL_OPTIONS, MATRIC_GROUPS, type ClassLevel } from "@/features/classes/level-presets";
import { cn } from "@/lib/cn";
import { MAX_SECTIONS, SECTION_LETTERS, nextLetter, type SectionRowValue } from "../class-rows";
import type { SetupFormValues } from "../schemas";

const GROUP_OPTIONS = [{ id: "none", name: "No group" }, ...MATRIC_GROUPS.map((group) => ({ id: group, name: group }))];

/** One class: include tick, name, level, section chips (with Science/Arts groups for Matric) and its subject count. */
export function ClassRowEditor({ index, onEditSubjects }: { index: number; onEditSubjects: () => void }) {
  const { control, setValue, formState } = useFormContext<SetupFormValues>();
  const row = useWatch({ control, name: `academics.classes.${index}` });
  const errors = formState.errors.academics?.classes?.[index];
  if (!row) return null;
  const prefix = `academics.classes.${index}` as const;
  const set = <K extends keyof typeof row>(key: K, value: (typeof row)[K]) =>
    setValue(`${prefix}.${key}` as never, value as never, { shouldDirty: true, shouldValidate: formState.isSubmitted });

  const letters = [...new Set([...SECTION_LETTERS, ...row.sections.map((section) => section.name)])].sort();
  const toggleSections = (names: string[]) =>
    set(
      "sections",
      names.map((name): SectionRowValue => row.sections.find((section) => section.name === name) ?? { name, group: "" }),
    );
  const addSection = () => {
    const letter = nextLetter(row.sections);
    if (letter) toggleSections([...row.sections.map((section) => section.name), letter].sort());
  };
  const setGroup = (name: string, group: string) =>
    set("sections", row.sections.map((section) => (section.name === name ? { ...section, group: group === "none" ? "" : group } : section)));

  return (
    <li className={cn("flex flex-col gap-3 rounded-input border border-border p-3", !row.include && "bg-background opacity-70")}>
      <div className="flex flex-wrap items-center gap-3">
        <Checkbox checked={row.include} onCheckedChange={(checked) => set("include", checked === true)} aria-label={`Include ${row.name || "class"}`} />
        {row.custom ? (
          <Input
            value={row.name}
            onChange={(event) => set("name", event.target.value)}
            aria-label="Class name"
            aria-invalid={!!errors?.name}
            className="h-9 w-40"
          />
        ) : (
          <span className="min-w-24 text-body font-medium text-fg">{row.name}</span>
        )}
        <OptionSelect
          label="Level"
          options={LEVEL_OPTIONS}
          value={row.level}
          onChange={(level) => set("level", level as ClassLevel)}
          disabled={!row.include}
          className="h-9 w-36"
        />
        <button
          type="button"
          onClick={onEditSubjects}
          disabled={!row.include}
          className="ml-auto text-label font-medium text-primary hover:underline disabled:text-fg-muted"
        >
          {row.subjects.length} subjects · Edit
        </button>
      </div>
      {row.include && (
        <div className="flex flex-col gap-2 pl-8">
          <ChipToggleGroup
            label={`Sections of ${row.name}`}
            options={letters}
            value={row.sections.map((section) => section.name)}
            onChange={toggleSections}
            onAddMore={row.sections.length < MAX_SECTIONS ? addSection : undefined}
            addLabel="Add another section"
            min={1}
          />
          {row.level === "MATRIC" && (
            <div className="flex flex-wrap gap-2">
              {row.sections.map((section) => (
                <div key={section.name} className="flex items-center gap-1.5">
                  <span className="text-caption font-semibold text-fg">{section.name}</span>
                  <OptionSelect
                    label={`Group of section ${section.name}`}
                    options={GROUP_OPTIONS}
                    value={section.group || "none"}
                    onChange={(group) => setGroup(section.name, group)}
                    className="h-9 w-32"
                  />
                </div>
              ))}
            </div>
          )}
          {(errors?.name?.message || errors?.sections?.message) && (
            <p role="alert" className="text-caption text-error">
              {errors?.name?.message ?? errors?.sections?.message}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
