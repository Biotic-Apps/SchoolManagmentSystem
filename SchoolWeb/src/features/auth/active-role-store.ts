// The chosen role context survives a page reload in this tab only (not sensitive; no token data).
const KEY = "eschool.activeRole";

export function loadActiveRole(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveActiveRole(role: string | null) {
  try {
    if (role) sessionStorage.setItem(KEY, role);
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage unavailable: the API falls back to the default role
  }
}
