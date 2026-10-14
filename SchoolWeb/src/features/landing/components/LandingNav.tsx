"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AppLogo } from "@/components/shared/AppLogo";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { LandingContainer } from "./LandingContainer";
import { NavMobileMenu } from "./NavMobileMenu";
import { NAV_LINKS } from "./navLinks";
import { SignInButton } from "./SignInButton";

/** Sticky landing header: transparent over the hero, frosted glass once the page scrolls. */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-(--dur-standard) ease-standard",
        solid ? "landing-glass border-border/70 shadow-[0_4px_20px_-8px_rgb(123_104_238/0.18)]" : "border-transparent bg-transparent",
      )}
    >
      <LandingContainer className="flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label="eSchool home" className={cn("rounded-tile", focusRing)}>
          <AppLogo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "group relative block rounded-full px-3.5 py-2 text-label font-medium text-fg-muted transition-colors duration-(--dur-quick) hover:bg-selected/70 hover:text-on-selected",
                    focusRing,
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-3.5 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-(--dur-standard) ease-standard group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SignInButton className="hidden sm:inline-flex" />
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "grid size-10 place-items-center rounded-full text-fg transition-colors duration-(--dur-quick) hover:bg-selected hover:text-on-selected lg:hidden",
              focusRing,
            )}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </LandingContainer>

      <NavMobileMenu id={menuId} open={open} onNavigate={() => setOpen(false)} />
    </header>
  );
}
