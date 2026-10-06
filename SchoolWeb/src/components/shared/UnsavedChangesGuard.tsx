"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface GuardContext {
  setDirty: (dirty: boolean) => void;
  guard: (action: () => void) => void;
}

const Context = createContext<GuardContext | null>(null);

/** Asks before an action would discard unsaved edits reported by a child (and on tab close). */
export function UnsavedChangesGuard({ children }: { children: ReactNode }) {
  const dirtyRef = useRef(false);
  const [dirty, setDirtyState] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const setDirty = useCallback((value: boolean) => {
    dirtyRef.current = value;
    setDirtyState(value);
  }, []);

  const guard = useCallback((action: () => void) => {
    if (dirtyRef.current) setPending(() => action);
    else action();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const value = useMemo(() => ({ setDirty, guard }), [setDirty, guard]);

  const discard = () => {
    const action = pending;
    setPending(null);
    setDirty(false);
    action?.();
  };

  return (
    <Context.Provider value={value}>
      {children}
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Discard unsaved changes?"
        description="You have changes that are not saved. If you continue, they will be lost."
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={discard}
      />
    </Context.Provider>
  );
}

/** Wraps an action so it asks first when there are unsaved edits. Without a guard it just runs. */
export function useGuardedAction() {
  const context = useContext(Context);
  return context?.guard ?? ((action: () => void) => action());
}

/** Reports this component's unsaved state to the nearest guard. */
export function useReportUnsaved(dirty: boolean) {
  const setDirty = useContext(Context)?.setDirty;
  useEffect(() => {
    setDirty?.(dirty);
    return () => setDirty?.(false);
  }, [dirty, setDirty]);
}
