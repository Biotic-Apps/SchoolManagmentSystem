"use client";

import { Button } from "@/components/ui/Button";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { fromTimeParts, pad, type Meridiem, type TimeParts } from "@/lib/time";
import { ClockFace, type ClockMode } from "./ClockFace";

interface TimePickerPanelProps {
  parts: TimeParts;
  mode: ClockMode;
  onModeChange: (mode: ClockMode) => void;
  onChange: (value: string) => void;
  /** Called after the minutes are picked, or Done. */
  onDone: () => void;
  onClear?: () => void;
}

function Segment({ active, label, children, onClick }: { active: boolean; label: string; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-input px-2 text-[34px] font-semibold leading-[48px] tabular-nums transition-colors",
        active ? "bg-selected text-on-selected" : "text-fg hover:bg-background",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}

function MeridiemToggle({ value, onChange }: { value: Meridiem; onChange: (value: Meridiem) => void }) {
  return (
    <div role="group" aria-label="AM or PM" className="flex flex-col overflow-hidden rounded-input border border-border-strong">
      {(["AM", "PM"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "px-3 py-1 text-label font-medium transition-colors",
            value === option ? "bg-primary text-on-primary" : "bg-surface text-fg-muted hover:bg-selected",
            focusRing,
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Material-style picker: big hour:minute readout, AM/PM, then the dial. */
export function TimePickerPanel({ parts, mode, onModeChange, onChange, onDone, onClear }: TimePickerPanelProps) {
  const update = (patch: Partial<TimeParts>) => onChange(fromTimeParts({ ...parts, ...patch }));

  const pick = (value: number) => {
    if (mode === "hour") {
      update({ hour: value });
      onModeChange("minute");
    } else {
      update({ minute: value });
      onDone();
    }
  };

  return (
    <div className="flex w-[264px] flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center">
          <Segment active={mode === "hour"} label={`Hour ${parts.hour}, change`} onClick={() => onModeChange("hour")}>
            {String(parts.hour)}
          </Segment>
          <span className="text-[34px] font-semibold text-fg-muted">:</span>
          <Segment active={mode === "minute"} label={`Minutes ${pad(parts.minute)}, change`} onClick={() => onModeChange("minute")}>
            {pad(parts.minute)}
          </Segment>
        </div>
        <MeridiemToggle value={parts.meridiem} onChange={(meridiem) => update({ meridiem })} />
      </div>
      <ClockFace mode={mode} value={mode === "hour" ? parts.hour : parts.minute} onPick={pick} />
      <div className="flex items-center justify-between gap-2">
        {onClear ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        ) : (
          <span className="text-caption text-fg-muted">{mode === "hour" ? "Pick the hour" : "Pick the minutes"}</span>
        )}
        <Button size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
