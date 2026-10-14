"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { SIGN_IN_URL } from "@/lib/site/links";
import { NAV_COPY } from "@/lib/site/content";
import { lockScroll } from "@/lib/site/scroll";
import { Logo } from "@/components/site/layout/Logo";
import { DesktopNav } from "@/components/site/layout/DesktopNav";
import { MenuToggle } from "@/components/site/layout/MenuToggle";
import { MobileMenu } from "@/components/site/layout/MobileMenu";
import { useNavScroll } from "@/components/site/layout/useNavScroll";
import { useFocusTrap } from "@/components/site/layout/useFocusTrap";

const spring = { type: "spring", stiffness: 320, damping: 34, mass: 0.8 } as const;

/**
 * A floating glass pill, detached from the top edge.
 *
 * Its footprint (14px gap + 56px pill) matches `--site-header-height` (4.5rem),
 * which the anchor `scroll-margin-top`, the Lenis `HEADER_OFFSET` and the sticky
 * scroll sections all measure from, so anchors still clear it.
 *
 * Every scroll-driven change is a transform or an opacity: the pill drops in
 * on load, eases a touch smaller once the page is under way (scale, not
 * height, so nothing reflows), slides out while reading down and back on the
 * first scroll up.
 */
export function Header() {
  const reduced = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { compact, hidden } = useNavScroll(!reduced);
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useFocusTrap(menuOpen, [headerRef, sheetRef], closeMenu);

  // Lenis drives `documentElement`, so the page behind the overlay has to be
  // frozen through `lockScroll`, not `overflow: hidden` on the body.
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [menuOpen]);

  const tucked = hidden && !menuOpen && openMenu === null;

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: tucked ? -110 : 0, opacity: tucked ? 0 : 1 }}
        transition={{ ...spring, opacity: { duration: 0.25 } }}
        className={cn(
          "pointer-events-none fixed inset-x-0 top-3.5 px-3 sm:px-5",
          menuOpen ? "z-[70]" : "z-50",
        )}
      >
        <motion.div
          animate={{ scale: compact && !menuOpen ? 0.975 : 1 }}
          transition={spring}
          className="pointer-events-auto relative mx-auto flex h-14 max-w-[1100px] items-center gap-3 rounded-full border border-white/80 bg-white/85 pl-4 pr-2 shadow-[0_10px_30px_-14px_rgb(91_75_199/0.35),0_1px_2px_rgb(42_31_107/0.05)] backdrop-blur-md sm:pl-5"
        >
          {/* A deeper shadow faded in once scrolled: opacity, not box-shadow. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 rounded-full shadow-[0_18px_44px_-16px_rgb(91_75_199/0.5)] transition-opacity duration-500",
              compact ? "opacity-100" : "opacity-0",
            )}
          />
          <Link href="/#top" aria-label={NAV_COPY.homeLabel} onClick={closeMenu} className="shrink-0">
            <Logo />
          </Link>

          <div className="flex flex-1 justify-center">
            <DesktopNav openMenu={openMenu} onOpenMenu={setOpenMenu} />
          </div>

          <div className="flex items-center gap-1.5">
            {/* `/login` is the one account action. A signed-in visitor is sent
                on to the dashboard server-side by `middleware.ts`. */}
            <Link
              href={SIGN_IN_URL}
              className="gradient-button inline-flex h-10 items-center gap-2 rounded-full px-4 text-[0.84rem] font-semibold text-white shadow-[0_6px_16px_-8px_rgb(91_75_199/0.8)] transition-[filter] hover:brightness-110 sm:px-5"
            >
              <LogIn aria-hidden className="size-4" strokeWidth={2.2} />
              {NAV_COPY.signIn}
            </Link>
            <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((value) => !value)} />
          </div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? <MobileMenu ref={sheetRef} onNavigate={closeMenu} /> : null}
      </AnimatePresence>
    </>
  );
}
