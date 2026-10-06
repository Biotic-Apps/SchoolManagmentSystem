import { Input } from "@/components/ui/Input";

interface DateFilterProps {
  label: string;
  value: string | undefined;
  min?: string;
  max?: string;
  onChange: (value: string | undefined) => void;
}

export function DateFilter({ label, value, min, max, onChange }: DateFilterProps) {
  return (
    <label className="flex items-center gap-2 text-label text-fg-muted">
      {label}
      <Input
        type="date"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="md:w-40"
      />
    </label>
  );
}
