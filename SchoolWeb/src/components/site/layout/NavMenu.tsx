"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/site/cn";
import type { NavMenu as NavMenuData } from "@/lib/site/links";

/** Grace period before a menu closes, so the diagonal to it is forgiving. */
const CLOSE_DELAY = 120;

/**
 * A navigation menu that opens on hover and on click.
 *
 * Hover alone is a trap for anyone using a keyboard or a touch screen, so the
 * button is a real toggle as well, `Escape` closes, and focus leaving the group
 * closes it. The short close delay stops the menu vanishing when the pointer
 * cuts a corner on its way down.
 */
export function NavMenu({ menu }: { menu: NavMenuData }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const cancelClose = () => window.clearTimeout(timer.current);
  const scheduleClose = () => {
    cancelClose();
    timer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-[0.86rem] font-medium transition-colors",
          open ? "bg-surface-sunken text-foreground" : "text-muted hover:text-foreground",
        )}
      >
        {menu.label}
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
          strokeWidth={2.4}
        />
      </button>

      <div
        id={id}
        className={cn(
          "absolute left-0 top-full w-[19rem] pt-2 transition-[opacity,transform] duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="panel p-2 shadow-[var(--shadow-lift)]">
          {menu.items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-sunken"
            >
              <span className="block text-[0.88rem] font-medium">{item.label}</span>
              <span className="mt-0.5 block text-[0.78rem] text-faint">{item.detail}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
