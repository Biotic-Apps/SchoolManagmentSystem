import { useCallback, useState } from "react";

/** Open/close state for a dialog or drawer that may carry the record it acts on. */
export function useDialogState<T>() {
  const [state, setState] = useState<{ open: boolean; item: T | null }>({ open: false, item: null });

  const show = useCallback((item?: T) => setState({ open: true, item: item ?? null }), []);
  const close = useCallback(() => setState({ open: false, item: null }), []);
  const onOpenChange = useCallback((open: boolean) => {
    if (!open) setState({ open: false, item: null });
  }, []);

  return { open: state.open, item: state.item, show, close, onOpenChange };
}

export type DialogState<T> = ReturnType<typeof useDialogState<T>>;
