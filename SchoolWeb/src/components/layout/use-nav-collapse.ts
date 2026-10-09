"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "eschool.nav.collapsed";

function readStored(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

/** Which sidebar sections the user folded away; remembered per browser. */
export function useNavCollapse() {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => {
    // Read after mount so server and first client render agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from browser storage
    setCollapsed(readStored());
  }, []);

  const toggle = useCallback((groupId: string) => {
    setCollapsed((current) => {
      const next = current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage blocked: the fold still works for this visit.
      }
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
