import { useEffect, useRef } from "react";

const FIRST_FIELD = "input:not([type=hidden]):not([disabled]):not([readonly]), textarea:not([disabled]), button[role=combobox]:not([disabled])";

/** Puts the cursor on the step's first invalid field, else its first field, whenever the step changes. */
export function useStepFocus<T extends HTMLElement>(stepKey: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>("[aria-invalid=true]") ?? root.querySelector<HTMLElement>(FIRST_FIELD);
    target?.focus();
  }, [stepKey]);
  return ref;
}
