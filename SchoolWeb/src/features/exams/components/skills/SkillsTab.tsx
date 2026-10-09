"use client";

import { Save, Settings2 } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Exam } from "../../types";
import { useSkillsTab } from "../../use-skills-tab";
import { SkillGridTable } from "./SkillGridTable";
import { SkillScaleLegend } from "./SkillScaleLegend";
import { SkillSetupDialog } from "./SkillSetupDialog";

/** Class teacher rates behaviour & skills per student; printed on the report card. */
export function SkillsTab({ exam }: { exam: Exam }) {
  const tab = useSkillsTab(exam);
  const { grid, editor } = tab;
  useReportUnsaved(editor.dirty);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <OptionSelect
          label={tab.sectionsLoading ? "Loading sections" : "Section"}
          options={tab.options}
          value={tab.sectionId}
          onChange={tab.setSectionId}
          className="md:w-64"
        />
        {tab.editable && grid && editor.blankCount > 0 && (
          <OptionSelect
            label="Fill empty cells with…"
            options={grid.scale.map((level) => ({ id: String(level.value), name: `${level.code} · ${level.label}` }))}
            value={null}
            onChange={(value) => editor.fillBlanks(Number(value))}
            className="md:w-56"
          />
        )}
        {tab.canSetup && (
          <Button variant="ghost" className="md:ml-auto" onClick={() => tab.setup.show(true)}>
            <Settings2 />
            Items & scale
          </Button>
        )}
      </div>
      {grid && !grid.editable && (
        <InlineNotice>Results are published, so these ratings are final.</InlineNotice>
      )}
      {tab.query.isLoading && <Skeleton className="h-64 w-full" />}
      {!!tab.query.error && <ErrorState error={tab.query.error} onRetry={() => tab.query.refetch()} />}
      {grid && (
        <>
          <p className="text-label text-fg-muted" role="status">
            {grid.complete} of {grid.students.length} students fully rated
            {editor.dirty && ` · ${editor.changes.length} unsaved ${editor.changes.length === 1 ? "change" : "changes"}`}
          </p>
          <SkillGridTable grid={grid} editor={editor} editable={tab.editable} />
          <SkillScaleLegend scale={grid.scale} />
        </>
      )}
      {tab.editable && grid && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={editor.reset} disabled={!editor.dirty || tab.saving}>
            Discard changes
          </Button>
          <Button onClick={tab.save} loading={tab.saving} disabled={!editor.dirty}>
            <Save />
            Save ratings
          </Button>
        </div>
      )}
      {tab.setup.open && <SkillSetupDialog branchId={exam.branchId} onClose={tab.setup.close} />}
    </div>
  );
}
