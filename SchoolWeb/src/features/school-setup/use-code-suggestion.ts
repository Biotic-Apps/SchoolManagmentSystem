import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { SetupFormValues } from "./schemas";

const SKIP = new Set(["THE", "OF", "AND"]);

/** "Bright Star School" → "BSS"; empty when the name gives fewer than 2 letters. */
export function codeFromName(name: string): string {
  const words = name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !SKIP.has(word));
  const code = words.length === 1 ? words[0].slice(0, 4) : words.map((word) => word[0]).join("").slice(0, 6);
  return code.length >= 2 ? code : "";
}

/** Suggests the school code from its name until the admin types a different code. */
export function useCodeSuggestion() {
  const { control, setValue, getValues } = useFormContext<SetupFormValues>();
  const name = useWatch({ control, name: "school.name" });
  const suggested = useRef(codeFromName(getValues("school.name")));

  useEffect(() => {
    const current = getValues("school.code").toUpperCase();
    if (current && current !== suggested.current) return;
    suggested.current = codeFromName(name ?? "");
    setValue("school.code", suggested.current);
  }, [name, getValues, setValue]);
}
