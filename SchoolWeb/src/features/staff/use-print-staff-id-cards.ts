import { useState } from "react";
import { usePrintStaffIdCards } from "./id-card-print-api";
import { DESIGNATION_OPTIONS } from "./options";

export function usePrintStaffIdCardsForm(branchId: string) {
  const [designation, setDesignation] = useState<string | undefined>(undefined);
  const [jobId, setJobId] = useState<string | null>(null);
  const print = usePrintStaffIdCards();

  return {
    designationOptions: [{ id: "", name: "All designations" }, ...DESIGNATION_OPTIONS],
    designation,
    setDesignation: (value: string) => {
      setDesignation(value || undefined);
      setJobId(null);
    },
    jobId,
    pending: print.isPending,
    submit: (event: React.FormEvent) => {
      event.preventDefault();
      setJobId(null);
      print.mutate(
        { branchId, designation: designation || undefined },
        { onSuccess: (data) => setJobId(data?.jobId ?? null) },
      );
    },
  };
}
