"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { NAV_HOME, NAV_LINKS, NAV_MENUS, SIGN_IN_URL } from "@/lib/site/links";
import { NAV_COPY } from "@/lib/site/content";
import { Button } from "@/components/site/ui/Button";
import { Logo } from "@/components/site/layout/Logo";
import { NavMenu } from "@/components/site/layout/NavMenu";
import { navIcon } from "@/components/site/layout/navIcons";
import { lockScroll } from "@/lib/site/scroll";

/**
 * Scroll distance before the bar picks up its backdrop. The bar itself is
 * `--header-height` (4.5rem, 72px) tall, which `HEADER_OFFSET` (-80) in
 * `SmoothScroll` and `scroll-margin-top` in `site.css` both clear.
 */
const ELEVATE_AT = 8;
const HomeIcon = navIcon(NAV_HOME.href);

/**
 * Sticky bar that picks up a backdrop once anything scrolls behind it.
 *
 * Two things here are deliberate and easy to undo by accident.
 *
 * The bar keeps **one height** at all times. Transitioning `height` on scroll
 * looks lively in a demo and costs a layout pass on the header every frame of
 * the transition, at exactly the moment the browser is busiest — and it walks
 * the anchor offsets out of step with `scroll-margin-top`, so jumping to a
 * section lands a few pixels wrong depending on where you were. Only the
 * backdrop changes now, which is compositor work.
 *
 * The elevated state is written **straight to the DOM**, not held in React
 * state. `scroll` fires at whatever rate the device can manage, and a setState
 * per event means re-rendering the logo, both dropdowns and the sign-in button
 * on the way past the threshold.
 */
export function Header() {
  const barRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    let elevated: boolean | null = null;

    const apply = () => {
      frame = 0;
      const next = window.scrollY > ELEVATE_AT;
      if (next === elevated) return;
      elevated = next;
      bar.toggleAttribute("data-elevated", next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The sheet covers the page, so the page behind it must not scroll. Lenis
  // drives `documentElement` itself, so this has to go through `lockScroll`
  // rather than setting `overflow` on the body and hoping.
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [menuOpen]);

  // A full-screen sheet is a dialog whether or not it is built from one: focus
  // moves into it, stays inside it, and comes back to the button that opened it.
  useEffect(() => {
    if (!menuOpen) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const opener = document.activeElement as HTMLElement | null;
    const trigger = triggerRef.current;
    const focusables = () =>
      Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => node.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (opener ?? trigger)?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <header
        ref={barRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-transparent bg-transparent",
          "transition-[background-color,border-color,box-shadow] duration-300",
          "data-[elevated]:border-line data-[elevated]:bg-background",
          "data-[elevated]:shadow-[var(--shadow-card)]",
        )}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center gap-4 px-5 sm:px-8">
          <Link href="/#top" aria-label={NAV_COPY.homeLabel}>
            <Logo />
          </Link>

          <nav
            aria-label={NAV_COPY.primaryLabel}
            className="ml-6 hidden items-center gap-0.5 lg:flex"
          >
            <Link
              href={NAV_HOME.href}
              className="rounded-lg px-3 py-2 text-[0.86rem] font-medium text-muted transition-colors hover:text-foreground"
            >
              {NAV_HOME.label}
            </Link>
            {NAV_MENUS.map((menu) => (
              <NavMenu key={menu.label} menu={menu} />
            ))}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-[0.86rem] font-medium text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Not `external` any more. The site and the application are one
                deployment now, so `SIGN_IN_URL` is the in-app path `/login`
                rather than another origin — opening it in a new tab would leave
                the visitor with the marketing page still sitting behind their
                session. A signed-in visitor is not a special case here either:
                `middleware.ts` sends them from `/login` to `/dashboard`, which
                is deliberately server-side. Reading the session client-side to
                relabel this button would decide its appearance from JavaScript
                state on first render, which is a hydration mismatch. */}
            <Button href={SIGN_IN_URL} className="hidden sm:inline-flex">
              <LogIn className="size-4" strokeWidth={2.2} />
              {NAV_COPY.signIn}
            </Button>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={NAV_COPY.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-sunken hover:text-foreground lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        ref={sheetRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={NAV_COPY.menuLabel}
        // `inert` keeps the closed sheet out of the accessibility tree and out
        // of the tab order, which `opacity-0` alone never did. React 19 takes
        // it as a real boolean; the old empty-string form now warns.
        inert={!menuOpen}
        className={cn(
          "fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-background lg:hidden",
          "transition-[opacity,visibility] duration-300",
          menuOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="sticky top-0 z-10 flex h-[var(--header-height)] items-center justify-between bg-background px-5 sm:px-8">
          <Logo />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={NAV_COPY.closeMenu}
            className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
          >
            <X className="size-5" strokeWidth={1.9} />
          </button>
        </div>

        <div className="px-5 pb-16 sm:px-8">
          <Link
            href={NAV_HOME.href}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 border-t border-line py-4 text-[1.05rem] font-medium"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <HomeIcon className="size-4" strokeWidth={2} aria-hidden />
            </span>
            {NAV_HOME.label}
          </Link>
          {NAV_MENUS.map((menu, menuIndex) => (
            <section
              key={menu.label}
              aria-label={menu.label}
              className="border-t border-line py-6"
            >
              {/* A group label inside a navigation sheet, not a heading. As
                  `<h2>` these two sat in front of the page's `<h1>` in document
                  order, so every page on the site opened its outline with two
                  headings belonging to a menu that is closed. */}
              <p
                aria-hidden
                className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-faint"
              >
                {menu.label}
              </p>
              <ul className="mt-4 space-y-1">
                {menu.items.map((item, index) => {
                  const Icon = navIcon(item.href);
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 py-2 text-[1.05rem] font-medium transition-[opacity,transform] duration-500",
                          menuOpen
                            ? "translate-y-0 opacity-100"
                            : "translate-y-3 opacity-0",
                        )}
                        style={{
                          transitionDelay: menuOpen
                            ? `${60 + (menuIndex * 5 + index) * 30}ms`
                            : "0ms",
                        }}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                          <Icon
                            className="size-4"
                            strokeWidth={2}
                            aria-hidden
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block">{item.label}</span>
                          <span className="block text-[0.8rem] font-normal text-faint">
                            {item.detail}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <section className="border-t border-line py-6">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = navIcon(link.href);
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-[1.05rem] font-medium"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                        <Icon className="size-4" strokeWidth={2} aria-hidden />
                      </span>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="border-t border-line pt-6">
            <Button href={SIGN_IN_URL} size="lg" className="w-full">
              <LogIn className="size-4" strokeWidth={2.2} />
              {NAV_COPY.signIn}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
