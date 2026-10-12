export type QrScanResultCode = "MARKED" | "ALREADY_MARKED" | "NOT_FOUND" | "OUTSIDE_HOURS";

export interface QrScanResult {
  result: QrScanResultCode;
  resolvedType: "STUDENT" | "STAFF" | null;
  name: string | null;
  photoUrl: string | null;
  classLabel: string | null;
  designation: string | null;
  admissionNo: string | null;
  employeeNo: string | null;
  timestamp: string;
}

export interface QrScanInput {
  publicId: string;
  type: "IN" | "OUT";
}

export interface QrScanLog {
  id: string;
  publicId: string;
  resolvedType: "STUDENT" | "STAFF" | null;
  resolvedName: string | null;
  result: string;
  scannedAt: string;
}
