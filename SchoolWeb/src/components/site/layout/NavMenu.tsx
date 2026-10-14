"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/site/cn";
import type { NavMenu as NavMenuData } from "@/lib/site/links";
import { MegaPanel } from "@/components/site/layout/MegaPanel";
import { NavHighlight } from "@/components/site/layout/NavHighlight";

/** Grace period before a menu closes, so the diagonal down to it is forgiving. */
const CLOSE_DELAY = 140;

/**
 * A menu trigger in the pill. Opens on hover and on click, closes on Escape
 * and when focus leaves it, so keyboard and touch work as well as a mouse.
 * Which menu is open is owned by the bar, so only one is ever open.
 */
export function NavMenu({
  menu,
  open,
  highlighted,
  onOpenChange,
}: {
  menu: NavMenuData;
  open: boolean;
  highlighted: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const id = useId();

  const cancelClose = () => window.clearTimeout(timer.current);
  const scheduleClose = () => {
    cancelClose();
    timer.current = window.setTimeout(() => onOpenChange(false), CLOSE_DELAY);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        onOpenChange(true);
      }}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onOpenChange(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "relative isolate flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.86rem] font-medium transition-colors",
          highlighted ? "text-brand-800" : "text-muted hover:text-foreground",
        )}
      >
        {highlighted ? <NavHighlight /> : null}
        {menu.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown aria-hidden className="size-3.5" strokeWidth={2.4} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? <MegaPanel id={id} menu={menu} onNavigate={() => onOpenChange(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}
