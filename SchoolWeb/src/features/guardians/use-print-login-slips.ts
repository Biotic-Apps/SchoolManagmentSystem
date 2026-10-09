import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSectionOptions } from "@/features/classes/sections-api";
import { targetInput, targetOptions } from "@/features/exams/print-targets";
import { loginPageUrl } from "./login-url";
import { usePreviewLoginSlips, usePrintLoginSlips, type LoginSlipPreview } from "./login-slips-api";

/** Bulk parent login slips: pick a class/section, review what changes, then print. */
export function usePrintLoginSlipsForm(branchId: string, sessionId: string, classes: Option[], classId?: string) {
  const sectionQuery = useSectionOptions(branchId, sessionId);
  const sections = sectionQuery.sections;
  const withSections = classes.filter((item) => sections.some((section) => section.classId === item.id));
  const [target, setTarget] = useState(classId ? `class:${classId}` : "all");
  const [review, setReview] = useState<LoginSlipPreview | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const preview = usePreviewLoginSlips();
  const print = usePrintLoginSlips();
  const input = () => ({ branchId, ...targetInput(target), loginUrl: loginPageUrl() });

  return {
    loading: sectionQuery.isLoading,
    options: targetOptions(withSections, sections).map((option) =>
      option.id === "all" ? { ...option, name: "Whole branch (all classes)" } : option,
    ),
    target,
    setTarget: (value: string) => {
      setTarget(value);
      setReview(null);
      setJobId(null);
    },
    review,
    jobId,
    pending: preview.isPending || print.isPending,
    submit: (event: React.FormEvent) => {
      event.preventDefault();
      if (!review) {
        setJobId(null);
        preview.mutate(input(), { onSuccess: (data) => setReview(data ?? null) });
        return;
      }
      print.mutate(input(), {
        onSuccess: (data) => {
          setJobId(data?.jobId ?? null);
          setReview(null);
        },
      });
    },
  };
}
