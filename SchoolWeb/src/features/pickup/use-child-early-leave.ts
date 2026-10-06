import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useActiveChild } from "@/features/auth/use-active-child";
import { useEarlyLeaves, usePickupPersons } from "./api";
import { childEarlyLeaveColumns } from "./child-early-leave-columns";

/** Parent: early-leave requests of the child picked in the Topbar switcher. */
export function useChildEarlyLeave() {
  const child = useActiveChild();
  const childId = child?.id ?? null;
  const query = useEarlyLeaves({ studentId: childId }, !!childId);
  const persons = usePickupPersons(childId);
  const [requesting, setRequesting] = useState(false);

  // The API scopes parents to their own children; filter in case it returns siblings too.
  const rows = useMemo(() => query.data?.filter((item) => item.student.id === childId), [query.data, childId]);
  const pickupOptions: Option[] = useMemo(
    () =>
      (persons.data ?? [])
        .filter((person) => person.status === "VERIFIED")
        .map((person) => ({ id: person.id, name: `${person.name} (${person.relation})` })),
    [persons.data],
  );
  const columns = useMemo(() => childEarlyLeaveColumns(), []);

  return { child, query, rows, columns, pickupOptions, requesting, setRequesting };
}
