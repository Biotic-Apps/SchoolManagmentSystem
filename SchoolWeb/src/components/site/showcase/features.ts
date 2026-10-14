import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Calculator,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  KeyRound,
  Layers,
  MessageSquareText,
  NotebookPen,
  Printer,
  Receipt,
  UserCheck,
  Users,
  Wallet,
  WifiOff,
  ArrowLeftRight,
} from "lucide-react";
import type { ScreenKey } from "@/lib/site/screens";
import {
  ACADEMICS_COPY,
  ACADEMICS_POINTS,
  ATTENDANCE_COPY,
  ATTENDANCE_POINTS,
  FEES_COPY,
  FEES_POINTS,
  PARENT_COPY,
  PARENT_POINTS,
} from "@/lib/site/content";

/**
 * The media query the stacking deck runs under. Below it (phones, tablets and
 * laptops too short to hold a whole card) the cards simply follow one another.
 * Shared by the Tailwind arbitrary variant in the markup and by GSAP's
 * `matchMedia`, so the two can never disagree.
 */
export const DECK_QUERY = "(min-width: 1024px) and (min-height: 700px)";

export type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: ReadonlyArray<{ title: string; body: string }>;
  icons: readonly LucideIcon[];
  screen: ScreenKey;
  /** The card's own soft wash, layered over the surface colour. */
  wash: string;
  /** Glow behind the screen. */
  glow: string;
};

export const FEATURES: readonly Feature[] = [
  {
    id: "attendance",
    ...ATTENDANCE_COPY,
    points: ATTENDANCE_POINTS,
    icons: [ClipboardCheck, WifiOff, NotebookPen, UserCheck],
    screen: "attendance",
    wash: "bg-[radial-gradient(120%_90%_at_0%_0%,var(--color-brand-100)_0%,transparent_55%),radial-gradient(90%_80%_at_100%_100%,var(--color-brand-200)_0%,transparent_60%)]",
    glow: "bg-brand-400/30",
  },
  {
    id: "academics",
    ...ACADEMICS_COPY,
    points: ACADEMICS_POINTS,
    icons: [CalendarClock, BadgeCheck, Calculator, Printer],
    screen: "academics",
    wash: "bg-[radial-gradient(120%_90%_at_0%_0%,var(--color-accent-100)_0%,transparent_55%),radial-gradient(90%_80%_at_100%_100%,var(--color-brand-100)_0%,transparent_60%)]",
    glow: "bg-accent-400/25",
  },
  {
    id: "fees",
    ...FEES_COPY,
    points: FEES_POINTS,
    icons: [Layers, Users, Receipt, Wallet],
    screen: "fees",
    wash: "bg-[radial-gradient(120%_90%_at_0%_0%,var(--color-indigo-100)_0%,transparent_55%),radial-gradient(90%_80%_at_100%_100%,var(--color-indigo-200)_0%,transparent_60%)]",
    glow: "bg-indigo-400/30",
  },
  {
    id: "parents",
    ...PARENT_COPY,
    points: PARENT_POINTS,
    icons: [ArrowLeftRight, KeyRound, CalendarDays, MessageSquareText],
    screen: "parent",
    wash: "bg-[radial-gradient(120%_90%_at_0%_0%,var(--color-violet-100)_0%,transparent_55%),radial-gradient(90%_80%_at_100%_100%,var(--color-accent-100)_0%,transparent_60%)]",
    glow: "bg-violet-400/30",
  },
];
