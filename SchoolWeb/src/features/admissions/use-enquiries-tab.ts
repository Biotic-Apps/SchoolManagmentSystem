import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import type { AcademicScope } from "@/features/classes/use-academic-scope";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useConvertEnquiry, useEnquiries } from "./api";
import { enquiryColumns } from "./enquiry-columns";
import type { Enquiry } from "./types";

type EnquiryFilters = { status?: string };

/** Enquiries of the branch; conversion hands the new application back to the page. */
export function useEnquiriesTab(scope: AcademicScope, onConverted: (applicationId: string) => void) {
  const can = useCan();
  const list = useListState<EnquiryFilters>({});
  // The contract filters enquiries by branch, status and search only.
  const query = useEnquiries({ ...list.params, branchId: scope.branchId }, !!scope.branchId);
  const form = useDialogState<true>();
  const update = useDialogState<Enquiry>();
  const convertTarget = useDialogState<Enquiry>();
  const convert = useConvertEnquiry();

  const canEdit = can("admissions.edit");
  const canConvert = can("admissions.add");

  const columns = useMemo(
    () =>
      enquiryColumns({
        onUpdate: canEdit ? update.show : undefined,
        onConvert: canConvert ? convertTarget.show : undefined,
      }),
    [canEdit, canConvert, update.show, convertTarget.show],
  );

  const confirmConvert = () => {
    const target = convertTarget.item;
    if (!target) return;
    convert.mutate(target.id, {
      onSuccess: (application) => {
        convertTarget.close();
        onConverted(application.id);
      },
    });
  };

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    canAdd: can("admissions.add") && !!scope.sessionId,
    form,
    update,
    convertTarget,
    confirmConvert,
    converting: convert.isPending,
  };
}
