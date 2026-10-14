"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { NavMenu } from "@/lib/site/links";
import { navIcon } from "@/components/site/layout/navIcons";

const panel: Variants = {
  closed: { opacity: 0, scale: 0.94, y: -8 },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 30,
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const item: Variants = {
  closed: { opacity: 0, y: 8 },
  open: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * The card that grows out of the pill under a menu trigger. It scales from its
 * top edge, so it reads as coming out of the bar rather than dropping onto it.
 */
export function MegaPanel({
  id,
  menu,
  onNavigate,
}: {
  id: string;
  menu: NavMenu;
  onNavigate: () => void;
}) {
  return (
    <div id={id} className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3">
      <motion.div
        variants={panel}
        initial="closed"
        animate="open"
        exit="closed"
        style={{ transformOrigin: "50% 0%" }}
        className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white p-2.5 shadow-[0_24px_60px_-24px_rgb(76_61_153/0.45),0_2px_8px_rgb(42_31_107/0.06)]"
      >
        <ul className="grid grid-cols-2 gap-1">
          {menu.items.map((entry) => {
            const Icon = navIcon(entry.href);
            return (
              <motion.li key={entry.label} variants={item}>
                <Link
                  href={entry.href}
                  onClick={onNavigate}
                  className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-brand-50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 ring-1 ring-inset ring-brand-200/60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg]">
                    <Icon aria-hidden className="size-[1.15rem]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-[0.88rem] font-semibold text-foreground">
                      {entry.label}
                      <ArrowRight
                        aria-hidden
                        className="size-3.5 -translate-x-1 text-brand-500 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        strokeWidth={2.4}
                      />
                    </span>
                    <span className="mt-0.5 block text-[0.78rem] leading-snug text-faint">
                      {entry.detail}
                    </span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
