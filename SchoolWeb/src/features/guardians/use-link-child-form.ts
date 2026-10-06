import { useState } from "react";
import { useWatch } from "react-hook-form";
import type { SearchPickerItem } from "@/components/shared/SearchPicker";
import { useStudents } from "@/features/students/api";
import { placementLabel } from "@/features/students/options";
import type { Relation } from "@/features/people/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useServerForm } from "@/lib/use-server-form";
import { useLinkChild } from "./api";
import { LINK_CHILD_DEFAULTS, linkChildSchema, type LinkChildValues } from "./schemas";
import type { GuardianDetail } from "./types";

/** Links one more student of the branch to this guardian (staff-created links are VERIFIED). */
export function useLinkChildForm(guardian: GuardianDetail, branchId: string | null, onDone: () => void) {
  const link = useLinkChild();
  const server = useServerForm<LinkChildValues>({
    schema: linkChildSchema,
    defaultValues: LINK_CHILD_DEFAULTS,
    onSubmit: (values) =>
      link.mutateAsync({
        studentId: values.studentId,
        input: { guardianId: guardian.id, relation: values.relation as Relation, isPrimary: values.isPrimary },
      }),
    onSuccess: onDone,
  });
  const { control, setValue, formState } = server.form;
  const studentId = useWatch({ control, name: "studentId" });

  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const query = useStudents({ page: 1, pageSize: 10, branchId, status: "ACTIVE", search: term || undefined }, !!branchId);

  const linkedIds = new Set(guardian.children.filter((child) => child.status !== "REVOKED").map((child) => child.studentId));
  const items: SearchPickerItem[] = (query.data?.data ?? [])
    .filter((student) => !linkedIds.has(student.id))
    .map((student) => ({
      id: student.id,
      title: student.name,
      caption: `${student.admissionNo} · ${placementLabel(student.className, student.sectionName)}`,
    }));

  return {
    ...server,
    picker: {
      search,
      onSearchChange: setSearch,
      items,
      selectedId: studentId || null,
      onSelect: (item: SearchPickerItem) => setValue("studentId", item.id, { shouldValidate: true }),
      loading: query.isFetching,
    },
    pickerError: formState.errors.studentId?.message,
  };
}
