"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";
import { popMotion } from "./styles";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, sideOffset = 6, align = "start", collisionPadding = 16, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        // pointer-events-auto: inside a modal dialog the body ignores pointer events.
        className={cn(
          "pointer-events-auto z-50 origin-(--radix-popover-content-transform-origin) rounded-card border border-border bg-surface p-4 shadow-overlay outline-none",
          popMotion,
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
