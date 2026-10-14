"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { cn } from "@/lib/site/cn";
import { NAV_LINKS, NAV_MENUS } from "@/lib/site/links";
import { NAV_COPY } from "@/lib/site/content";
import { NavMenu } from "@/components/site/layout/NavMenu";
import { NavHighlight } from "@/components/site/layout/NavHighlight";
import { useActiveSection } from "@/components/site/layout/useActiveSection";

/** Section id → the menu that lists it, so scrolling lights up the right one. */
const SECTION_TO_MENU = new Map(
  NAV_MENUS.flatMap((menu) =>
    menu.items.map((item) => [item.href.split("#")[1] ?? "", menu.label] as const),
  ),
);
const SECTION_IDS = [...SECTION_TO_MENU.keys()].filter(Boolean);

/**
 * The links inside the pill (lg and up). One purple highlight is shared by all
 * of them: it sits under the hovered item, else the open menu, else whichever
 * item matches the page or the section being read, and glides between them.
 */
export function DesktopNav({
  openMenu,
  onOpenMenu,
}: {
  openMenu: string | null;
  onOpenMenu: (label: string | null) => void;
}) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const section = useActiveSection(pathname === "/" ? SECTION_IDS : []);

  const current = useMemo(() => {
    const link = NAV_LINKS.find((entry) => entry.href === pathname);
    if (link) return link.label;
    return section ? (SECTION_TO_MENU.get(section) ?? null) : null;
  }, [pathname, section]);

  const highlight = hovered ?? openMenu ?? current;

  return (
    <LayoutGroup id="site-nav">
      <nav
        aria-label={NAV_COPY.primaryLabel}
        onMouseLeave={() => setHovered(null)}
        className="hidden items-center gap-0.5 lg:flex"
      >
        {NAV_MENUS.map((menu) => (
          <div key={menu.label} onMouseEnter={() => setHovered(menu.label)}>
            <NavMenu
              menu={menu}
              open={openMenu === menu.label}
              highlighted={highlight === menu.label}
              onOpenChange={(open) =>
                onOpenMenu(open ? menu.label : openMenu === menu.label ? null : openMenu)
              }
            />
          </div>
        ))}
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onMouseEnter={() => setHovered(link.label)}
            aria-current={pathname === link.href ? "page" : undefined}
            className={cn(
              "relative isolate rounded-full px-3.5 py-2 text-[0.86rem] font-medium transition-colors",
              highlight === link.label ? "text-brand-800" : "text-muted hover:text-foreground",
            )}
          >
            {highlight === link.label ? <NavHighlight /> : null}
            {link.label}
          </Link>
        ))}
      </nav>
    </LayoutGroup>
  );
}
