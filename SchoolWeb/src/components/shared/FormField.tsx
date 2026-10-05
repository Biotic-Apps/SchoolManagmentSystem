import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

interface FormFieldProps {
  id: string;
  label: string;
  error?: FieldError;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function errorId(id: string) {
  return `${id}-error`;
}

export function FormField({ id, label, error, hint, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </Label>
      {children}
      {error?.message ? (
        <p id={errorId(id)} role="alert" className="text-caption text-error">
          {error.message}
        </p>
      ) : (
        hint && <p className="text-caption text-fg-muted">{hint}</p>
      )}
    </div>
  );
}
