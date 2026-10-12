import { API_URL } from "@/config/env";
import { getAccessToken, getActiveRoleHeader } from "@/lib/request-context";
import { useApiMutation } from "@/lib/use-api-mutation";

export interface FamilyChallanInput {
  branchId: string;
  guardianId?: string;
  studentIds?: string[];
}

async function fetchFamilyChallan(input: FamilyChallanInput): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const role = getActiveRoleHeader();
  if (role) headers["X-Active-Role"] = role;

  const res = await fetch(`${API_URL}/invoices/challans/family`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Family challan failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  return url;
}

/**
 * POST /invoices/challans/family: combined PDF of all open invoices
 * for a guardian's children (or a set of student IDs). Opens in a new tab.
 */
export function useFamilyChallan() {
  return useApiMutation({
    mutationFn: fetchFamilyChallan,
    success: "Family challan opened",
    toastError: false,
  });
}
