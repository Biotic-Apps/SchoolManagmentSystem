import type { Option } from "@/components/shared/OptionSelect";

export type ReportFormat = "PDF" | "XLSX" | "CSV";

export type ReportParamType =
  | "branch"
  | "date"
  | "month"
  | "class"
  | "section"
  | "session"
  | "exam"
  | "select"
  | "text"
  | "number";

/** Catalog item as the API may send it; the contract leaves the shape open. */
export interface ReportCatalogItem {
  key: string;
  name?: string;
  title?: string;
  description?: string;
  area?: string;
  group?: string;
  category?: string;
  params?: {
    name?: string;
    key?: string;
    label?: string;
    type?: string;
    required?: boolean;
    options?: (string | { id?: string; value?: string; name?: string; label?: string })[];
  }[];
  formats?: string[];
}

export interface ReportParam {
  name: string;
  label: string;
  type: ReportParamType;
  required: boolean;
  options: Option[];
}

export interface Report {
  key: string;
  name: string;
  description: string | null;
  area: string;
  params: ReportParam[];
  formats: ReportFormat[];
}

export interface ReportRequest {
  key: string;
  params: Record<string, string | number>;
  format: ReportFormat;
}

export interface ReportJob {
  status: string;
  fileUrl?: string | null;
  error?: string | null;
}

export interface RecentExport {
  jobId: string;
  key: string;
  name: string;
  format: ReportFormat;
  startedAt: string;
}
