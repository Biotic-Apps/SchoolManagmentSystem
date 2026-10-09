import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSectionOptions } from "@/features/classes/sections-api";
import { targetInput, targetOptions } from "@/features/exams/print-targets";
import { usePrintIdCards } from "./id-card-print-api";

/** Bulk ID card sheets for the branch session on screen. */
export function usePrintIdCardsForm(branchId: string, sessionId: string, classes: Option[], classId?: string) {
  const sectionQuery = useSectionOptions(branchId, sessionId);
  const sections = sectionQuery.sections;
  const withSections = classes.filter((item) => sections.some((section) => section.classId === item.id));
  const [target, setTarget] = useState(classId ? `class:${classId}` : "all");
  const [jobId, setJobId] = useState<string | null>(null);
  const print = usePrintIdCards();

  return {
    loading: sectionQuery.isLoading,
    options: targetOptions(withSections, sections).map((option) =>
      option.id === "all" ? { ...option, name: "Whole branch (all classes)" } : option,
    ),
    target,
    setTarget: (value: string) => {
      setTarget(value);
      setJobId(null);
    },
    jobId,
    pending: print.isPending,
    submit: (event: React.FormEvent) => {
      event.preventDefault();
      setJobId(null);
      print.mutate({ branchId, ...targetInput(target) }, { onSuccess: (data) => setJobId(data?.jobId ?? null) });
    },
  };
}
