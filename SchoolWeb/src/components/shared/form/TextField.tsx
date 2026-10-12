"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FormField, errorId } from "../FormField";
import { fieldError, fieldId } from "./field-error";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id"> {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
}

const TYPE_DEFAULTS: Partial<Record<string, Pick<InputHTMLAttributes<HTMLInputElement>, "inputMode" | "autoComplete">>> = {
  email: { inputMode: "email", autoComplete: "email" },
  tel: { inputMode: "tel", autoComplete: "tel" },
  number: { inputMode: "numeric" },
};

export function TextField({ name, label, hint, required, className, inputClassName, ...inputProps }: TextFieldProps) {
  const { register, formState } = useFormContext();
  const error = fieldError(formState.errors, name);
  const id = fieldId(name);
  const isPassword = inputProps.type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType = isPassword && showPassword ? "text" : inputProps.type;

  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <Input
          id={id}
          className={isPassword ? `pr-10 ${inputClassName ?? ""}` : inputClassName}
          aria-invalid={!!error}
          aria-describedby={error ? errorId(id) : undefined}
          {...(inputProps.type ? TYPE_DEFAULTS[inputProps.type] : undefined)}
          {...inputProps}
          type={resolvedType}
          {...register(name)}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg transition-colors"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </FormField>
  );
}
