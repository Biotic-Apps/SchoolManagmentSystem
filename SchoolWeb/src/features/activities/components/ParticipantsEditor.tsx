"use client";

import { Save } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { participantColumns } from "../participant-columns";
import type { Activity, ConsentRow, Participant } from "../types";
import { useParticipantsEditor } from "../use-participants-editor";
import { AddParticipant } from "./AddParticipant";

interface ParticipantsEditorProps {
  activity: Activity;
  initial: Participant[];
  consents: ConsentRow[];
  editable: boolean;
}

export function ParticipantsEditor({ activity, initial, consents, editable }: ParticipantsEditorProps) {
  const editor = useParticipantsEditor(activity.id, initial, consents);

  return (
    <div className="flex flex-col gap-3">
      {editable && <AddParticipant activity={activity} editor={editor} />}
      <DataTable
        columns={participantColumns(editor, editable)}
        rows={editor.rows}
        getRowId={(row) => row.studentId}
        emptyTitle="No participants yet"
        emptyDescription={
          activity.consentRequired
            ? "Add students whose parents granted consent."
            : "Add the students taking part."
        }
      />
      {editable && (
        <div className="flex justify-end">
          <Button onClick={editor.save} loading={editor.saving} disabled={!editor.dirty}>
            <Save />
            Save participants
          </Button>
        </div>
      )}
    </div>
  );
}
