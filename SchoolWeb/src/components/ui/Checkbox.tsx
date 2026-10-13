"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

export const Checkbox = forwardRef<
  ComponentRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-[6px] border border-border-strong bg-surface transition-[background-color,border-color,color,box-shadow] duration-(--dur-quick) ease-standard hover:border-primary/50",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-on-primary data-[state=checked]:shadow-[0_1px_3px_rgb(123_104_238/0.25)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        focusRing,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
