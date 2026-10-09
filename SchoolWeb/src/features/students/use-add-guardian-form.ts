import { useState } from "react";
import { useWatch } from "react-hook-form";
import type { SearchPickerItem } from "@/components/shared/SearchPicker";
import { useGuardians, useLinkGuardian } from "@/features/guardians/api";
import type { AddedGuardianLink, ParentLogin } from "@/features/guardians/types";
import { ADD_GUARDIAN_DEFAULTS, addGuardianSchema, toLinkGuardianInput, type AddGuardianValues } from "@/features/guardians/schemas";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useServerForm } from "@/lib/use-server-form";
import type { StudentDetail } from "./types";

/** A new password or a login that could not be made is worth showing; an existing login is not. */
const worthShowing = (login: ParentLogin | null) => !!login && (!!login.temporaryPassword || login.status === "SKIPPED");

/**
 * Links an existing guardian of the branch, or creates a new one, to this
 * student. The guardian gets a parent sign-in; a new one is shown once.
 */
export function useAddGuardianForm(student: StudentDetail, onDone: () => void) {
  const link = useLinkGuardian(student.id);
  const [parentLogin, setParentLogin] = useState<ParentLogin | null>(null);
  const server = useServerForm<AddGuardianValues, AddedGuardianLink>({
    schema: addGuardianSchema,
    defaultValues: ADD_GUARDIAN_DEFAULTS,
    onSubmit: (values) => link.mutateAsync(toLinkGuardianInput(values)),
    onSuccess: (added) => (worthShowing(added.parentLogin) ? setParentLogin(added.parentLogin) : onDone()),
  });
  const { control, setValue, formState } = server.form;
  const mode = useWatch({ control, name: "mode" });
  const guardianId = useWatch({ control, name: "guardianId" });

  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim());
  const branchId = student.enrollment?.branchId;
  const query = useGuardians(
    { page: 1, pageSize: 10, branchId, search: term || undefined },
    mode === "existing" && !!branchId,
  );

  const linkedIds = new Set(student.guardians.filter((row) => row.status !== "REVOKED").map((row) => row.guardian.id));
  const items: SearchPickerItem[] = (query.data?.data ?? [])
    .filter((guardian) => !linkedIds.has(guardian.id))
    .map((guardian) => ({ id: guardian.id, title: guardian.name, caption: [guardian.phone, guardian.email].filter(Boolean).join(" · ") }));

  return {
    ...server,
    parentLogin,
    mode,
    picker: {
      search,
      onSearchChange: setSearch,
      items,
      selectedId: guardianId || null,
      onSelect: (item: SearchPickerItem) => setValue("guardianId", item.id, { shouldValidate: true }),
      loading: query.isFetching,
    },
    pickerError: formState.errors.guardianId?.message,
  };
}
