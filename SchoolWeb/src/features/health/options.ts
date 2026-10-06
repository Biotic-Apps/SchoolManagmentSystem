import type { Option } from "@/components/shared/OptionSelect";
import type { BadgeTone } from "@/components/ui/Badge";
import { humanize } from "@/lib/format";
import type { IncidentSeverity, IncidentType } from "./types";

const toOptions = (codes: readonly string[]): Option[] => codes.map((id) => ({ id, name: humanize(id) }));

export const INCIDENT_TYPES: readonly IncidentType[] = ["INJURY", "ILLNESS", "ALLERGIC_REACTION", "OTHER"];
export const INCIDENT_SEVERITIES: readonly IncidentSeverity[] = ["MINOR", "MODERATE", "SERIOUS"];
export const ALLERGY_SEVERITIES = ["MILD", "MODERATE", "SEVERE"] as const;

export const INCIDENT_TYPE_OPTIONS = toOptions(INCIDENT_TYPES);
export const INCIDENT_SEVERITY_OPTIONS = toOptions(INCIDENT_SEVERITIES);
export const ALLERGY_SEVERITY_OPTIONS = toOptions(ALLERGY_SEVERITIES);

export const BLOOD_GROUP_OPTIONS: Option[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((id) => ({ id, name: id }));

const ALLERGY_TONES: Record<string, BadgeTone> = {
  MILD: "info",
  MINOR: "info",
  MODERATE: "warning",
  SEVERE: "error",
  SERIOUS: "error",
  LIFE_THREATENING: "error",
};

export function allergyTone(severity: string | null | undefined): BadgeTone {
  return ALLERGY_TONES[(severity ?? "").toUpperCase()] ?? "neutral";
}
