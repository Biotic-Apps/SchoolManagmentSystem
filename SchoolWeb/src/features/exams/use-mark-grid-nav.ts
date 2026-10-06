import { useCallback, useRef, type KeyboardEvent } from "react";

/** Enter / ArrowDown moves to the next row's marks input, ArrowUp to the previous (skipping disabled ones). */
export function useMarkGridNav() {
  const inputs = useRef(new Map<number, HTMLInputElement>());

  const register = useCallback(
    (index: number) => (element: HTMLInputElement | null) => {
      if (element) inputs.current.set(index, element);
      else inputs.current.delete(index);
    },
    [],
  );

  const move = useCallback((from: number, step: 1 | -1) => {
    const indexes = [...inputs.current.keys()];
    const last = indexes.length ? Math.max(...indexes) : -1;
    for (let index = from + step; index >= 0 && index <= last; index += step) {
      const element = inputs.current.get(index);
      if (element && !element.disabled) {
        element.focus();
        element.select();
        return;
      }
    }
  }, []);

  const onKeyDown = useCallback(
    (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === "ArrowDown") {
        event.preventDefault();
        move(index, 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        move(index, -1);
      }
    },
    [move],
  );

  return { register, onKeyDown };
}

export type MarkGridNav = ReturnType<typeof useMarkGridNav>;
