export interface ScopeValue {
  schoolId: string | null;
  branchId: string | null;
  sessionId: string | null;
}

export type ScopeKey = keyof ScopeValue;

// Changing a parent level clears the levels below it.
export function nextScope(current: ScopeValue, key: ScopeKey, id: string): ScopeValue {
  if (key === "schoolId") return { schoolId: id, branchId: null, sessionId: null };
  if (key === "branchId") return { ...current, branchId: id, sessionId: null };
  return { ...current, sessionId: id };
}
