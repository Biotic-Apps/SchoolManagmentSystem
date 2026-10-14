"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, LogIn } from "lucide-react";
import { NAV_LINKS, NAV_MENUS, SIGN_IN_URL } from "@/lib/site/links";
import { NAV_COPY } from "@/lib/site/content";
import { navIcon } from "@/components/site/layout/navIcons";

const list: Variants = {
  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } },
};

const row: Variants = {
  closed: { opacity: 0, y: 28 },
  open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const GROUPS = [
  ...NAV_MENUS.map((menu) => ({ label: menu.label, items: menu.items })),
  { label: "", items: NAV_LINKS.map((link) => ({ ...link, detail: "" })) },
];

/**
 * Full-screen purple overlay for small screens. The pill stays on top of it
 * (it holds the close button), so the content starts below the pill.
 */
export const MobileMenu = forwardRef<HTMLDivElement, { onNavigate: () => void }>(
  function MobileMenu({ onNavigate }, ref) {
    return (
      <motion.div
        ref={ref}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={NAV_COPY.menuLabel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.1 } }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[radial-gradient(120%_70%_at_100%_0%,rgb(236_72_153/0.35),transparent_60%),linear-gradient(160deg,var(--color-brand-500),var(--color-brand-700)_45%,var(--color-brand-900))] text-white lg:hidden"
      >
        <motion.div
          variants={list}
          initial="closed"
          animate="open"
          exit="closed"
          className="mx-auto max-w-lg px-6 pb-12 pt-28"
        >
          {GROUPS.map((group) => (
            <div key={group.label || "links"} className="mb-7">
              {group.label ? (
                <motion.p
                  variants={row}
                  aria-hidden
                  className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/55"
                >
                  {group.label}
                </motion.p>
              ) : null}
              <ul>
                {group.items.map((item) => {
                  const Icon = navIcon(item.href);
                  return (
                    <motion.li key={item.label} variants={row}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className="group flex items-center gap-4 py-2.5 text-[1.4rem] font-semibold leading-tight tracking-[-0.02em] min-[400px]:text-[1.6rem] sm:text-[1.9rem]"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-inset ring-white/20">
                          <Icon aria-hidden className="size-[1.1rem]" strokeWidth={2} />
                        </span>
                        <span className="min-w-0 flex-1">{item.label}</span>
                        <ArrowUpRight
                          aria-hidden
                          className="size-5 shrink-0 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={2}
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          ))}

          <motion.div variants={row} className="mt-4 grid gap-3">
            <Link
              href={SIGN_IN_URL}
              onClick={onNavigate}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white text-[0.95rem] font-semibold text-brand-800 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.4)]"
            >
              <LogIn aria-hidden className="size-4" strokeWidth={2.2} />
              {NAV_COPY.signIn}
            </Link>
            <Link
              href="/contact"
              onClick={onNavigate}
              className="inline-flex h-13 items-center justify-center rounded-full border border-white/30 text-[0.95rem] font-semibold text-white"
            >
              {NAV_COPY.contact}
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  },
);
