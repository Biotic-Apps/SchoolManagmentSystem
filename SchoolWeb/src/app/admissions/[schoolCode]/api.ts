import { API_URL } from "@/config/env";

const BASE = `${API_URL}/public/admissions`;

export interface PublicSchoolInfo {
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
}

export interface PublicBranch {
  id: string;
  code: string;
  name: string;
}

export interface PublicClass {
  id: string;
  name: string;
  levelOrder: number;
}

export interface PublicSession {
  id: string;
  name: string;
  branchId: string;
}

export interface FormConfig {
  school: PublicSchoolInfo;
  branches: PublicBranch[];
  classes: PublicClass[];
  sessions: PublicSession[];
}

export interface ApplicationResult {
  applicationNo: string;
  childName: string;
  className: string;
  status: string;
  createdAt: string;
}

export interface ApplicationStatus {
  applicationNo: string;
  childName: string;
  className: string;
  status: string;
  createdAt: string;
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    const msg = body?.error?.message || body?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body.data as T;
}

export async function fetchFormConfig(schoolCode: string): Promise<FormConfig> {
  const res = await fetch(`${BASE}/schools/${encodeURIComponent(schoolCode)}/form-config`);
  return json<FormConfig>(res);
}

export async function submitApplication(
  schoolCode: string,
  data: Record<string, unknown>,
): Promise<ApplicationResult> {
  const res = await fetch(`${BASE}/schools/${encodeURIComponent(schoolCode)}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return json<ApplicationResult>(res);
}

export async function checkStatus(applicationNo: string): Promise<ApplicationStatus> {
  const res = await fetch(`${BASE}/status/${encodeURIComponent(applicationNo)}`);
  return json<ApplicationStatus>(res);
}
