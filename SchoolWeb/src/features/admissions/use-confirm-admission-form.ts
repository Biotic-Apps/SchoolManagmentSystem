import { useState } from "react";
import { useWatch } from "react-hook-form";
import { useSectionOptions } from "@/features/classes/sections-api";
import { ApiError, hasErrorCode } from "@/lib/api-error";
import { useServerForm } from "@/lib/use-server-form";
import { useConfirmApplication } from "./api";
import { confirmFormDefaults, confirmSchema, toConfirmInput, type ConfirmFormValues } from "./schemas";
import type { Application, ConfirmedAdmission } from "./types";

const SECTION_FULL = "Section is full";

const sectionFull = () => new ApiError(409, { code: "CONFLICT", message: SECTION_FULL });

/** Confirm an offered application: fee status, section (capacity-checked) and admission date. */
export function useConfirmAdmissionForm(app: Application) {
  const confirm = useConfirmApplication();
  const sections = useSectionOptions(app.branchId, app.sessionId, app.classId);
  const [confirmed, setConfirmed] = useState<ConfirmedAdmission | null>(null);
  const [loginsSeen, setLoginsSeen] = useState(false);

  const server = useServerForm<ConfirmFormValues, ConfirmedAdmission>({
    schema: confirmSchema,
    defaultValues: confirmFormDefaults(),
    onSubmit: async (values) => {
      if (sections.isFull(values.sectionId)) throw sectionFull();
      try {
        return await confirm.mutateAsync({ id: app.id, body: toConfirmInput(values) });
      } catch (error) {
        // The contract's only 409 here is a full section (someone took the last seat meanwhile).
        throw hasErrorCode(error, "CONFLICT") ? sectionFull() : error;
      }
    },
    onSuccess: setConfirmed,
    conflictField: "sectionId",
  });

  const feeStatus = useWatch({ control: server.form.control, name: "feeStatus" });
  const sectionOptions = sections.options.map((option) =>
    sections.isFull(option.id) ? { ...option, name: `${option.name} — full` } : option,
  );

  return {
    ...server,
    paid: feeStatus === "PAID",
    sectionOptions,
    sectionsLoading: sections.isLoading,
    noSections: !sections.isLoading && sections.options.length === 0,
    allFull: sections.options.length > 0 && sections.options.every((option) => sections.isFull(option.id)),
    studentId: confirmed?.studentId ?? null,
    /** Parent sign-in details to show before the enrolled step. */
    pendingLogins: confirmed && !loginsSeen && confirmed.parentLogins.length > 0 ? confirmed : null,
    loginsSeen: () => setLoginsSeen(true),
  };
}
