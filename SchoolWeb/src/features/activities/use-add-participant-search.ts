import { useForm, useWatch } from "react-hook-form";
import { useStudent } from "@/features/students/api";
import type { ParticipantsEditor } from "./use-participants-editor";

/** Picks a student via StudentSearchField and adds them once their name has loaded. */
export function useAddParticipantSearch(editor: ParticipantsEditor) {
  const form = useForm<{ studentId: string }>({ defaultValues: { studentId: "" } });
  const studentId = useWatch({ control: form.control, name: "studentId" });
  const student = useStudent(studentId || null);
  const ready = !!studentId && !!student.data && !editor.has(studentId);

  return {
    form,
    ready,
    add: () => {
      if (!ready || !student.data) return;
      editor.add(studentId, student.data.name);
      form.reset({ studentId: "" });
    },
  };
}
