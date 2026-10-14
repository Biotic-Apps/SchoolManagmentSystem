"use client";

import { type RefObject, useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab inside `roots` while `active`, closes on Escape, and hands focus
 * back to whatever had it on the way out. Several roots, because the mobile
 * menu's close button lives in the pill while its links live in the overlay.
 */
export function useFocusTrap(
  active: boolean,
  roots: RefObject<HTMLElement | null>[],
  onEscape: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;

    const focusables = () =>
      roots
        .flatMap((ref) =>
          ref.current ? Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)) : [],
        )
        .filter((node) => node.getClientRects().length > 0 && !node.closest("[inert]"));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current ? nodes.includes(current) : false;

      if (event.shiftKey && (current === first || !inside)) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && (current === lastNode || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
    // `roots` are stable refs and `onEscape` only ever closes the menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
