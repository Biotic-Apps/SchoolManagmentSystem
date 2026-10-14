"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Bus,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  Wallet,
  School,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/site/cn";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";

/**
 * Two sizes, not nine.
 *
 * A set where every tile is a different size reads as an accident. Two sizes on
 * a clear rhythm reads as a decision, and lets the larger ones carry the
 * modules a school leans on most.
 *
 * They are deliberately big — around 136px and 112px. Small tiles scattered in
 * white space look like stray bullet points; at this size they read as objects
 * in the room, which is the only reason to have them at all.
 */
const LARGE = 7.5;
const SMALL = 6.75;

type FloatingIcon = {
  icon: LucideIcon;
  label: string;
  /** Vertical position within the hero. */
  top: string;
  left?: string;
  right?: string;
  size: number;
  /** Resting tilt, in degrees. */
  tilt: number;
  /** Higher travels further on scroll, as a nearer object would. */
  depth: number;
  /** A purple, pink, sky or indigo tint from the site palette. */
  colour: string;
  delay: number;
};

/**
 * The application's own side rail, icon for icon, arranged as a ring around the
 * headline rather than as two columns down the edges.
 *
 * That is the whole difference. Tiles stacked in a straight line at each margin
 * read as a border; the same tiles alternating between near the centre and out
 * at the edge read as objects scattered in a space, which is what a hero needs
 * them to be. Each side steps in, out, in, out as it descends.
 *
 * All ten sit inside the top 8%–45% of the hero — the band a visitor sees
 * before scrolling. Nothing crosses the middle: that column is the headline's,
 * and nothing starts high enough to drift under the Sign In button.
 */
const ICONS: FloatingIcon[] = [
  // The top pair sit above the badge, well inside the width — this is what
  // turns two side columns into a ring around the content.
  { icon: BookOpen, label: "Homework", top: "5%", left: "32%", size: LARGE, tilt: 9, depth: 30, colour: "text-tile-sky", delay: 0.58 },
  { icon: Award, label: "Report cards", top: "5%", right: "32%", size: SMALL, tilt: -10, depth: 22, colour: "text-accent-500", delay: 0.64 },

  // Then out to the shoulders…
  { icon: GraduationCap, label: "Students", top: "13%", left: "9%", size: LARGE, tilt: -7, depth: 130, colour: "text-brand-500", delay: 0.05 },
  { icon: CalendarCheck, label: "Attendance", top: "12%", right: "8%", size: LARGE, tilt: 7, depth: 120, colour: "text-brand-600", delay: 0.12 },

  // …back in beside the headline…
  { icon: School, label: "Branches", top: "22%", left: "20%", size: SMALL, tilt: 6, depth: 55, colour: "text-tile-indigo", delay: 0.19 },
  { icon: Wallet, label: "Fees", top: "20%", right: "20%", size: SMALL, tilt: -6, depth: 60, colour: "text-tile-violet", delay: 0.26 },

  // …out to the edges…
  { icon: Users, label: "Parents", top: "33%", left: "2%", size: SMALL, tilt: -5, depth: 90, colour: "text-accent-500", delay: 0.33 },
  { icon: Bus, label: "Pickup", top: "35%", right: "1%", size: SMALL, tilt: 5, depth: 95, colour: "text-tile-sky", delay: 0.4 },

  // …and in again to close the ring.
  { icon: ClipboardCheck, label: "Exams", top: "45%", left: "8%", size: SMALL, tilt: 8, depth: 40, colour: "text-tile-violet", delay: 0.47 },
  { icon: MessageSquare, label: "Messages", top: "47%", right: "9%", size: SMALL, tilt: -8, depth: 45, colour: "text-tile-indigo", delay: 0.54 },
];

/**
 * Module tiles drifting in the space either side of the headline.
 *
 * Every icon is one a principal, teacher or parent will meet again inside the portal, so the
 * hero shows the shape of the product before a word is read.
 *
 * Three motions run at once and each is on its own element, because a CSS
 * animation overrides an inline transform and they would otherwise cancel out:
 * GSAP parallax on the outside, a float-and-sway in the middle, and the
 * entrance spring inside.
 *
 * Shown from `xl` up. Below that the headline needs the full width, and tiles
 * behind text is just noise.
 */
export function FloatingIcons() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-depth]").forEach((tile) => {
        const depth = Number(tile.dataset.depth ?? 0);
        gsap.to(tile, {
          // Nearest tiles clear roughly 90px over the hero; the furthest barely move.
          yPercent: -(depth / 130) * 85,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      {ICONS.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.label}
            data-depth={item.depth}
            className="absolute"
            style={{ top: item.top, left: item.left, right: item.right }}
          >
            <span
              className="float-sway block"
              style={{
                animationDelay: `${item.delay * 2.2}s`,
                // Uneven periods stop the set from pulsing in unison.
                animationDuration: `${6 + (item.depth % 4) * 0.9}s`,
              }}
            >
              <motion.span
                data-motion
                initial={{ scale: 0.3, opacity: 0, rotate: item.tilt - 22 }}
                animate={{ scale: 1, opacity: 1, rotate: item.tilt }}
                transition={{ type: "spring", stiffness: 210, damping: 16, delay: item.delay }}
                // No hard border — a grey outline makes a floating object look
                // like a pasted sticker. A soft ring plus a wide, low shadow is
                // what reads as lifted off the page.
                className={cn(
                  "grid place-items-center bg-white/65 ring-1 ring-white/60 backdrop-blur-md",
                  "shadow-[0_1px_3px_rgb(11_18_32/0.03),0_24px_48px_-26px_rgb(11_18_32/0.22)]",
                )}
                style={{
                  width: `${item.size}rem`,
                  height: `${item.size}rem`,
                  // Radius scales with the tile so the corner is always the
                  // same shape, not the same measurement.
                  borderRadius: `${item.size * 0.26}rem`,
                }}
              >
                <Icon
                  className={item.colour}
                  style={{
                    width: `${item.size * 0.44}rem`,
                    height: `${item.size * 0.44}rem`,
                  }}
                  strokeWidth={1.6}
                />
              </motion.span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
