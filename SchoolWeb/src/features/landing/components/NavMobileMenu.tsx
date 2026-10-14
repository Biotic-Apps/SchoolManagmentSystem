"use client";

import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "./navLinks";
import { SignInButton } from "./SignInButton";

interface NavMobileMenuProps {
  id: string;
  open: boolean;
  onNavigate: () => void;
}

/** Full-width dropdown under the nav bar (below lg). Fades + slides; hidden from AT when closed. */
export function NavMobileMenu({ id, open, onNavigate }: NavMobileMenuProps) {
  return (
    <div
      id={id}
      inert={!open}
      aria-hidden={!open}
      className={cn(
        "landing-glass absolute inset-x-0 top-full border-b border-border/70 shadow-overlay lg:hidden",
        "origin-top transition-[opacity,translate] duration-(--dur-standard) ease-decelerate",
        open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0 motion-reduce:translate-y-0",
      )}
    >
      <nav aria-label="Sections" className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 pb-5 pt-3 sm:px-6">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "rounded-input px-3 py-3 text-body font-medium text-fg transition-colors duration-(--dur-quick) hover:bg-selected hover:text-on-selected",
              focusRing,
            )}
          >
            {link.label}
          </a>
        ))}
        <SignInButton className="mt-3 w-full" onClick={onNavigate} />
      </nav>
    </div>
  );
}
