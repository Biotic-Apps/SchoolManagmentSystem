import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCan } from "@/features/auth/use-can";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useStaffList } from "./api";
import { DESIGNATION_OPTIONS, STAFF_STATUS_OPTIONS } from "./options";
import { staffColumns } from "./staff-columns";
import type { CreatedStaff, StaffSummary } from "./types";

interface Revealed {
  staffId: string;
  title: string;
  password: string;
}

export function useStaffPage() {
  const can = useCan();
  const router = useRouter();
  const picker = useBranchPicker();
  const list = useListState<{ designation?: string; status?: string }>({ designation: undefined, status: undefined });
  const query = useStaffList({ ...list.params, branchId: picker.branchId }, !!picker.branchId);
  const create = useDialogState<true>();
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const columns = useMemo(() => staffColumns(), []);

  const openStaff = (id: string) => router.push(`/staff/${id}`);

  // The temporary password is shown once; closing it continues to the new profile.
  const onCreated = ({ staff, temporaryPassword }: CreatedStaff) => {
    create.close();
    if (temporaryPassword) {
      setRevealed({ staffId: staff.id, title: `Temporary password for ${staff.name}`, password: temporaryPassword });
    } else {
      openStaff(staff.id);
    }
  };

  const closeRevealed = () => {
    if (revealed) openStaff(revealed.staffId);
    setRevealed(null);
  };

  return {
    picker,
    list,
    query,
    rows: query.data?.data,
    loading: picker.isLoading || query.isLoading,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    designationOptions: DESIGNATION_OPTIONS,
    statusOptions: STAFF_STATUS_OPTIONS,
    canAdd: can("staff.add") && !!picker.branchId,
    create,
    onCreated,
    onRowClick: (row: StaffSummary) => openStaff(row.id),
    revealed,
    closeRevealed,
  };
}
