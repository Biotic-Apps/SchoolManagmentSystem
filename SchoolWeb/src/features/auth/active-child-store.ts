// The child picked in the parent's ChildSwitcher survives a page reload in this tab (an id only, not sensitive).
const KEY = "eschool.activeChild";

export function loadActiveChild(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveActiveChild(childId: string | null) {
  try {
    if (childId) sessionStorage.setItem(KEY, childId);
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage unavailable: the first child is selected after a reload
  }
}
