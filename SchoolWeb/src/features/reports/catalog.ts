import type { Option } from "@/components/shared/OptionSelect";
import { humanize } from "@/lib/format";
import { DEFAULT_PARAMS, REPORT_TEXT, TYPE_LABEL } from "./report-defaults";
import type { Report, ReportCatalogItem, ReportFormat, ReportParam, ReportParamType } from "./types";

export const REPORT_AREAS = ["Attendance", "Academics", "Fees", "Payroll", "Expenses", "Inventory", "Branches"];
export const OTHER_AREA = "Other";

const AREA_BY_PREFIX: Record<string, string> = {
  attendance: "Attendance",
  results: "Academics",
  exams: "Academics",
  fees: "Fees",
  payroll: "Payroll",
  expenses: "Expenses",
  inventory: "Inventory",
  branch: "Branches",
  branches: "Branches",
};

const FORMATS: ReportFormat[] = ["PDF", "XLSX", "CSV"];
const PARAM_TYPES: ReportParamType[] = [
  "school", "branch", "date", "month", "class", "section", "session", "exam", "select", "text", "number",
];

/** The API types ids as "uuid"; these are the pickers they map to. */
const PICKER_TYPES: ReportParamType[] = ["school", "branch", "class", "section", "session", "exam"];
const PICKER_BY_NAME: Record<string, ReportParamType> = {
  schoolId: "school",
  branchId: "branch",
  classId: "class",
  sectionId: "section",
  sessionId: "session",
  examId: "exam",
};
/** API scalar types with a different web name. */
const TYPE_ALIASES: Record<string, ReportParamType> = { int: "number", integer: "number" };

function areaOf(item: ReportCatalogItem): string {
  const given = item.area ?? item.group ?? item.category;
  const known = given && REPORT_AREAS.find((area) => area.toLowerCase() === given.toLowerCase());
  return known || AREA_BY_PREFIX[item.key.split(".")[0]] || OTHER_AREA;
}

type RawParam = NonNullable<ReportCatalogItem["params"]>[number];

function optionsOf(raw: RawParam): Option[] {
  return (raw.options ?? []).map((option) => {
    if (typeof option === "string") return { id: option, name: humanize(option) };
    const id = option.id ?? option.value ?? "";
    return { id, name: option.label ?? option.name ?? humanize(id) };
  });
}

function typeOf(raw: RawParam, name: string): ReportParamType {
  if (raw.type === "uuid") {
    return PICKER_TYPES.find((item) => item === raw.picker) ?? PICKER_BY_NAME[name] ?? "text";
  }
  return PARAM_TYPES.find((item) => item === raw.type) ?? TYPE_ALIASES[raw.type ?? ""] ?? "text";
}

export function paramOf(raw: RawParam, reportKey = ""): ReportParam | null {
  const name = raw.name ?? raw.key;
  if (!name) return null;
  const type = typeOf(raw, name);
  const fallbackLabel = DEFAULT_PARAMS[reportKey]?.find((spec) => spec.name === name)?.label;
  return {
    name,
    type,
    label: raw.label ?? fallbackLabel ?? TYPE_LABEL[type] ?? humanize(name),
    required: raw.required ?? false,
    options: optionsOf(raw),
  };
}

function reportOf(item: ReportCatalogItem): Report {
  const text = REPORT_TEXT[item.key];
  const params = item.params?.length
    ? item.params.map((raw) => paramOf(raw, item.key)).filter((param): param is ReportParam => !!param)
    : (DEFAULT_PARAMS[item.key] ?? []).map((spec) => ({ ...spec, options: [] }));
  const formats = (item.formats ?? []).filter((format): format is ReportFormat => FORMATS.includes(format as ReportFormat));
  return {
    key: item.key,
    name: item.name ?? item.title ?? text?.name ?? humanize(item.key.replace(".", " ")),
    description: item.description ?? text?.description ?? null,
    area: areaOf(item),
    params,
    formats: formats.length ? formats : FORMATS,
  };
}

/** Accepts a plain list, `{ reports }`, or groups `{ area, reports }[]`; keys alone are fine too. */
export function normalizeCatalog(data: unknown): Report[] {
  const list = Array.isArray(data) ? data : ((data as { reports?: unknown[] } | null)?.reports ?? []);
  const items: ReportCatalogItem[] = [];
  for (const entry of list) {
    if (typeof entry === "string") items.push({ key: entry });
    else if (entry && typeof entry === "object") {
      const group = entry as { area?: string; name?: string; reports?: unknown[] } & Partial<ReportCatalogItem>;
      if (Array.isArray(group.reports)) {
        for (const nested of group.reports) {
          const item = typeof nested === "string" ? { key: nested } : (nested as ReportCatalogItem);
          if (item?.key) items.push({ area: group.area ?? group.name, ...item });
        }
      } else if (group.key) items.push(group as ReportCatalogItem);
    }
  }
  return items.map(reportOf);
}

export interface ReportGroup {
  area: string;
  reports: Report[];
}

export function groupByArea(reports: Report[]): ReportGroup[] {
  return [...REPORT_AREAS, OTHER_AREA]
    .map((area) => ({ area, reports: reports.filter((report) => report.area === area) }))
    .filter((group) => group.reports.length > 0);
}
