import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useServerForm } from "@/lib/use-server-form";
import { useRegisterStudent } from "./api";
import {
  registerStudentDefaults,
  registerStudentSchema,
  toRegisterStudentInput,
  type RegisterStudentValues,
} from "./schemas";
import type { StudentDetail } from "./types";

interface RegisterScope {
  branchId: string;
  sessionId: string;
  classId: string | undefined;
}

/** Direct registration (bypassing admissions); opens the new student's page when done. */
export function useRegisterStudentForm(scope: RegisterScope) {
  const router = useRouter();
  const register = useRegisterStudent();
  const server = useServerForm<RegisterStudentValues, StudentDetail>({
    schema: registerStudentSchema,
    defaultValues: registerStudentDefaults(scope.classId),
    onSubmit: (values) => register.mutateAsync(toRegisterStudentInput(values)),
    onSuccess: (student) => router.push(`/students/${student.id}`),
  });

  const { control, setValue, getValues } = server.form;
  const classId = useWatch({ control, name: "classId" });
  const sectionId = useWatch({ control, name: "sectionId" });
  const sections = useSectionOptions(scope.branchId, scope.sessionId, classId || null);

  // A section picked for another class is no longer valid.
  useEffect(() => {
    const current = getValues("sectionId");
    if (current && !sections.isLoading && !sections.options.some((option) => option.id === current)) {
      setValue("sectionId", "");
    }
  }, [classId, sections.isLoading, sections.options, getValues, setValue]);

  return { ...server, sections, sectionFull: !!sectionId && sections.isFull(sectionId) };
}
