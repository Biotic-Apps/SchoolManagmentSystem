"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";
import { useTabIndicator } from "./use-tab-indicator";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, children, ...props }, ref) {
  const { listRef, style } = useTabIndicator<HTMLDivElement>();
  return (
    <TabsPrimitive.List
      ref={(node) => {
        listRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-indicator={style ? "" : undefined}
      className={cn(
        "group/tabs relative inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-input border border-border bg-surface p-1 shadow-xs",
        className,
      )}
      {...props}
    >
      {style && (
        <span
          aria-hidden
          style={style}
          className="pointer-events-none absolute left-0 top-0 rounded-lg bg-primary shadow-[0_1px_2px_rgb(11_127_116/0.3)] transition-[transform,width,height] duration-280 ease-standard motion-reduce:transition-none"
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
});

export const TabsTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative z-[1] inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-3 text-label font-medium text-fg-muted transition-colors duration-180",
        "hover:text-fg data-[state=active]:bg-primary data-[state=active]:text-on-primary group-data-[indicator]/tabs:data-[state=active]:bg-transparent",
        focusRing,
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = forwardRef<
  ComponentRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("mt-4 outline-none data-[state=active]:animate-fade-in", className)}
      {...props}
    />
  );
});
