import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldBase } from "./styles";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return <input ref={ref} type={type} className={cn(fieldBase, "h-11", className)} {...props} />;
});
