"use client";

import { useFormContext } from "react-hook-form";
import { errorId } from "@/components/shared/FormField";
import { fieldError } from "@/components/shared/form/field-error";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { MIN_CONTRAST } from "@/features/branding/contrast";
import type { PrimaryColorState } from "../../use-primary-color";
import { PrimaryColorPresets } from "./PrimaryColorPresets";

const ID = "field-primaryColor";

function liveMessage(color: PrimaryColorState): string | null {
  if (!color.isHex) return "Enter a hex colour like #0B7F74.";
  if (!color.passes) {
    return `Pick a darker colour — white text on it needs a contrast of at least ${MIN_CONTRAST} : 1 to stay readable.`;
  }
  return null;
}

export function PrimaryColorField({ color }: { color: PrimaryColorState }) {
  const { formState } = useFormContext();
  const message = fieldError(formState.errors, "primaryColor")?.message ?? liveMessage(color);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={ID}>Primary colour</Label>
      <PrimaryColorPresets value={color.value} onPick={color.setColor} />
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          aria-label="Pick primary colour"
          value={color.pickerValue}
          onChange={(event) => color.setColor(event.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-input border border-border bg-surface p-1 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Input
          id={ID}
          value={color.value}
          onChange={(event) => color.setColor(event.target.value)}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          className="w-32 font-mono uppercase"
          aria-invalid={!!message}
          aria-describedby={message ? errorId(ID) : undefined}
        />
        {color.ratioText && (
          <div className="flex items-center gap-2">
            <span className="text-label tabular-nums text-fg">{color.ratioText}</span>
            <Badge tone={color.passes ? "success" : "error"}>{color.passes ? "Passes AA" : "Too light"}</Badge>
          </div>
        )}
        {!color.isDefault && (
          <Button variant="ghost" size="sm" onClick={color.resetToDefault}>
            Reset to default
          </Button>
        )}
      </div>
      {message ? (
        <p id={errorId(ID)} role="alert" className="text-caption text-error">
          {message}
        </p>
      ) : (
        <p className="text-caption text-fg-muted">Contrast against white text. At least {MIN_CONTRAST} : 1 is required.</p>
      )}
    </div>
  );
}
