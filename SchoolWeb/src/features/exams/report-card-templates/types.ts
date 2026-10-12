export interface TemplateLayout {
  orientation: "portrait" | "landscape";
  paperSize: string;
}

export interface TemplateHeader {
  showLogo: boolean;
  schoolName?: string;
  subtitle?: string;
  address?: string;
  phone?: string;
}

export interface ReportCardTemplate {
  id: string;
  schoolId: string;
  branchId: string | null;
  name: string;
  isDefault: boolean;
  layout: TemplateLayout;
  header: TemplateHeader;
  showGradingScale: boolean;
  showSkills: boolean;
  showRemarks: boolean;
  showAttendance: boolean;
  showPosition: boolean;
  signatures: string[];
  remarkLabels: string[] | null;
  footerText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCardTemplateInput {
  name: string;
  branchId?: string;
  isDefault?: boolean;
  layout?: Partial<TemplateLayout>;
  header?: Partial<TemplateHeader>;
  showGradingScale?: boolean;
  showSkills?: boolean;
  showRemarks?: boolean;
  showAttendance?: boolean;
  showPosition?: boolean;
  signatures?: string[];
  remarkLabels?: string[];
  footerText?: string;
}
