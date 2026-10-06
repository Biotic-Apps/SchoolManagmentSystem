import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { SearchPickerItem } from "@/components/shared/SearchPicker";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useStudents } from "./api";

/** Search active students in scope by name or admission number and store the picked id in a form field. */
export function useStudentSearchField(name: string, params: { branchId?: string | null; sectionId?: string | null } = {}) {
  const { control, setValue } = useFormContext();
  const selectedId = (useWatch({ control, name }) as string | undefined) || null;
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const query = useStudents(
    { page: 1, pageSize: 10, status: "ACTIVE", search: term || undefined, branchId: params.branchId, sectionId: params.sectionId },
    term.length > 0 || !!params.sectionId,
  );

  const items: SearchPickerItem[] = (query.data?.data ?? []).map((student) => ({
    id: student.id,
    title: student.name,
    caption: [student.admissionNo, [student.className, student.sectionName].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(" · "),
  }));

  return {
    search,
    onSearchChange: setSearch,
    items,
    selectedId,
    onSelect: (item: SearchPickerItem) => setValue(name, item.id, { shouldValidate: true, shouldDirty: true }),
    loading: query.isFetching,
  };
}
