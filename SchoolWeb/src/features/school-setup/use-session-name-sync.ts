import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { sessionNameFor } from "./presets";
import type { SetupFormValues } from "./schemas";

/** Keeps the session name in step with the dates until the admin types their own. */
export function useSessionNameSync() {
  const { control, setValue, getValues } = useFormContext<SetupFormValues>();
  const [startDate, endDate] = useWatch({ control, name: ["academics.startDate", "academics.endDate"] });
  const suggested = useRef(sessionNameFor(getValues("academics.startDate"), getValues("academics.endDate")));

  useEffect(() => {
    const current = getValues("academics.sessionName");
    const name = sessionNameFor(startDate, endDate);
    if ((current && current !== suggested.current) || !name) return;
    suggested.current = name;
    setValue("academics.sessionName", name);
  }, [startDate, endDate, getValues, setValue]);
}
