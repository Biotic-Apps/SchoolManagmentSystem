"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { Button } from "@/components/ui/Button";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import type { Activity } from "../types";
import { useAddParticipantSearch } from "../use-add-participant-search";
import type { ParticipantsEditor } from "../use-participants-editor";

interface AddParticipantProps {
  activity: Activity;
  editor: ParticipantsEditor;
}

/** Consent activities add from GRANTED consents only; others search any student of the branch. */
export function AddParticipant({ activity, editor }: AddParticipantProps) {
  if (activity.consentRequired) return <AddFromConsents editor={editor} />;
  return <AddBySearch branchId={activity.branchId} editor={editor} />;
}

function AddFromConsents({ editor }: { editor: ParticipantsEditor }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const option = editor.grantedOptions.find((item) => item.id === studentId);
  const add = () => {
    if (!option) return;
    editor.add(option.id, option.name);
    setStudentId(null);
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <OptionSelect
        label={editor.grantedOptions.length ? "Student with consent" : "No more students with consent"}
        options={editor.grantedOptions}
        value={studentId}
        onChange={setStudentId}
        className="sm:w-72"
      />
      <Button variant="secondary" className="h-11" onClick={add} disabled={!option}>
        <UserPlus />
        Add
      </Button>
    </div>
  );
}

function AddBySearch({ branchId, editor }: { branchId: string; editor: ParticipantsEditor }) {
  const search = useAddParticipantSearch(editor);
  return (
    <FormProvider {...search.form}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="sm:w-80">
          <StudentSearchField name="studentId" label="Add a student" branchId={branchId} />
        </div>
        <Button variant="secondary" className="h-11" onClick={search.add} disabled={!search.ready}>
          <UserPlus />
          Add
        </Button>
      </div>
    </FormProvider>
  );
}
