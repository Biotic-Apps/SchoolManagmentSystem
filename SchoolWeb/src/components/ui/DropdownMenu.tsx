"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { overlaySurface, popMotion } from "./styles";

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

const itemBase =
  "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-100 text-label text-fg outline-none " +
  "data-[highlighted]:bg-selected data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-fg-muted";

export const DropdownMenuContent = forwardRef<
  ComponentRef<typeof MenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, align = "end", ...props }, ref) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) p-1.5",
          overlaySurface,
          popMotion,
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
});

export const DropdownMenuItem = forwardRef<
  ComponentRef<typeof MenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Item>
>(function DropdownMenuItem({ className, ...props }, ref) {
  return <MenuPrimitive.Item ref={ref} className={cn(itemBase, className)} {...props} />;
});

export const DropdownMenuRadioItem = forwardRef<
  ComponentRef<typeof MenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <MenuPrimitive.RadioItem ref={ref} className={cn(itemBase, "pr-8", className)} {...props}>
      {children}
      <MenuPrimitive.ItemIndicator className="absolute right-2">
        <Check className="text-primary" />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.RadioItem>
  );
});

export const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof MenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Label>
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return <MenuPrimitive.Label ref={ref} className={cn("px-3 py-2 text-caption text-fg-muted", className)} {...props} />;
});

export const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof MenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return <MenuPrimitive.Separator ref={ref} className={cn("-mx-1.5 my-1.5 h-px bg-border", className)} {...props} />;
});
