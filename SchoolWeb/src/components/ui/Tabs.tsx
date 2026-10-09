"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";
import { useTabIndicator } from "./use-tab-indicator";

/** Lets a panel know whether it mounted with the tabs (first render: no fade) or by switching (fade). */
const TabsMountedContext = createContext<(() => boolean) | null>(null);

export const Tabs = forwardRef<
  ComponentRef<typeof TabsPrimitive.Root>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function Tabs(props, ref) {
  const mounted = useRef(false);
  const [isMounted] = useState(() => () => mounted.current);
  useEffect(() => {
    mounted.current = true;
  }, []);
  return (
    <TabsMountedContext.Provider value={isMounted}>
      <TabsPrimitive.Root ref={ref} {...props} />
    </TabsMountedContext.Provider>
  );
});

export const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, children, ...props }, ref) {
  const { listRef, style, animated } = useTabIndicator<HTMLDivElement>();
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
          className={cn(
            "pointer-events-none absolute left-0 top-0 rounded-lg bg-primary shadow-[0_1px_2px_rgb(11_127_116/0.3)] will-change-transform",
            animated && "transition-[transform,width,height] duration-(--dur-standard) ease-standard motion-reduce:transition-none",
          )}
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
        "relative z-[1] inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-3 text-label font-medium text-fg-muted transition-colors duration-(--dur-quick)",
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
  const isMounted = useContext(TabsMountedContext);
  // Decided once at mount: panels shown with the page appear as-is; switching to a panel fades it in.
  const [fade] = useState(() => isMounted?.() ?? false);
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("mt-4 outline-none", fade && "data-[state=active]:animate-fade-in", className)}
      {...props}
    />
  );
});
