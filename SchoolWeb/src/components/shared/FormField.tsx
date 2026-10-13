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
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} className="text-label font-medium text-fg">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </Label>
      {children}
      {error?.message ? (
        <p id={errorId(id)} role="alert" className="animate-fade-in text-caption font-medium text-error">
          {error.message}
        </p>
      ) : (
        hint && <p className="text-caption text-fg-muted">{hint}</p>
      )}
    </div>
  );
}
