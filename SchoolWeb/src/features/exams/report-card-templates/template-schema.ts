import { z } from "zod";
import type { ReportCardTemplate, ReportCardTemplateInput } from "./types";

export const templateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  branchId: z.string().uuid().optional().or(z.literal("")),
  isDefault: z.boolean(),
  layout: z.object({
    orientation: z.enum(["portrait", "landscape"]),
    paperSize: z.string(),
  }),
  header: z.object({
    showLogo: z.boolean(),
    schoolName: z.string().max(200).optional().or(z.literal("")),
    subtitle: z.string().max(300).optional().or(z.literal("")),
    address: z.string().max(300).optional().or(z.literal("")),
    phone: z.string().max(50).optional().or(z.literal("")),
  }),
  showGradingScale: z.boolean(),
  showSkills: z.boolean(),
  showRemarks: z.boolean(),
  showAttendance: z.boolean(),
  showPosition: z.boolean(),
  signatures: z.array(z.string()),
  remarkLabels: z.array(z.string()).optional(),
  footerText: z.string().max(300).optional().or(z.literal("")),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

const DEFAULTS: TemplateFormValues = {
  name: "",
  branchId: "",
  isDefault: false,
  layout: { orientation: "portrait", paperSize: "A4" },
  header: { showLogo: true, schoolName: "", subtitle: "", address: "", phone: "" },
  showGradingScale: true,
  showSkills: true,
  showRemarks: true,
  showAttendance: false,
  showPosition: true,
  signatures: ["Class teacher", "Principal", "Parent / guardian"],
  remarkLabels: [],
  footerText: "",
};

/** Map an API template to form values for editing. */
export function templateToValues(t: ReportCardTemplate): TemplateFormValues {
  return {
    name: t.name,
    branchId: t.branchId ?? "",
    isDefault: t.isDefault,
    layout: { orientation: t.layout.orientation, paperSize: t.layout.paperSize },
    header: {
      showLogo: t.header.showLogo,
      schoolName: t.header.schoolName ?? "",
      subtitle: t.header.subtitle ?? "",
      address: t.header.address ?? "",
      phone: t.header.phone ?? "",
    },
    showGradingScale: t.showGradingScale,
    showSkills: t.showSkills,
    showRemarks: t.showRemarks,
    showAttendance: t.showAttendance,
    showPosition: t.showPosition,
    signatures: t.signatures,
    remarkLabels: t.remarkLabels ?? [],
    footerText: t.footerText ?? "",
  };
}

/** Map form values to the API input shape. */
export function valuesToInput(v: TemplateFormValues): ReportCardTemplateInput {
  return {
    name: v.name,
    branchId: v.branchId || undefined,
    isDefault: v.isDefault,
    layout: v.layout,
    header: v.header,
    showGradingScale: v.showGradingScale,
    showSkills: v.showSkills,
    showRemarks: v.showRemarks,
    showAttendance: v.showAttendance,
    showPosition: v.showPosition,
    signatures: v.signatures.filter(Boolean),
    remarkLabels: v.remarkLabels?.filter(Boolean),
    footerText: v.footerText || undefined,
  };
}

export { DEFAULTS as templateDefaults };
