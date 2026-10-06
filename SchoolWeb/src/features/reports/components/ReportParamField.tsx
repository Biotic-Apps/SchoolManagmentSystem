import type { Option } from "@/components/shared/OptionSelect";
import { MonthField } from "@/components/shared/form/MonthField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import type { ReportParam } from "../types";

const PICKER_TYPES = new Set(["branch", "class", "section", "session", "exam"]);

interface ReportParamFieldProps {
  param: ReportParam;
  /** Choices for branch / class / section / session / exam params. */
  options: Option[];
}

export function ReportParamField({ param, options }: ReportParamFieldProps) {
  const { name, label, required } = param;
  if (param.type === "month") return <MonthField name={name} label={label} required={required} />;
  if (param.type === "date") return <TextField name={name} label={label} required={required} type="date" />;
  if (param.type === "number") {
    return <TextField name={name} label={label} required={required} type="number" min={0} inputMode="numeric" />;
  }
  if (param.type === "select" || PICKER_TYPES.has(param.type)) {
    return (
      <SelectField
        name={name}
        label={label}
        required={required}
        options={param.type === "select" ? param.options : options}
        emptyLabel={required ? undefined : "All"}
      />
    );
  }
  return <TextField name={name} label={label} required={required} />;
}
