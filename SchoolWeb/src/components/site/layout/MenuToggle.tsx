"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { NAV_COPY } from "@/lib/site/content";

const ease = [0.65, 0, 0.35, 1] as const;

/** Three bars that fold into an X: the outer two rotate in, the middle fades. */
export const MenuToggle = forwardRef<HTMLButtonElement, { open: boolean; onToggle: () => void }>(
  function MenuToggle({ open, onToggle }, ref) {
    const bar = "absolute left-1/2 top-1/2 -ml-[9px] -mt-px h-[2px] w-[18px] rounded-full bg-current";
    return (
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        aria-label={open ? NAV_COPY.closeMenu : NAV_COPY.openMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="relative grid size-10 place-items-center rounded-full bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-100 transition-colors hover:bg-brand-100 lg:hidden"
      >
        <motion.span
          className={bar}
          animate={open ? { y: 0, rotate: 45 } : { y: -6, rotate: 0 }}
          transition={{ duration: 0.3, ease }}
        />
        <motion.span
          className={bar}
          animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.2 : 1 }}
          transition={{ duration: 0.2, ease }}
        />
        <motion.span
          className={bar}
          animate={open ? { y: 0, rotate: -45 } : { y: 6, rotate: 0 }}
          transition={{ duration: 0.3, ease }}
        />
      </button>
    );
  },
);
