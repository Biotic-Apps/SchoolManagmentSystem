import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/site/cn";
import { NAV_COPY } from "@/lib/site/content";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "outlineOnDark";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-full " +
  "transition-[background-color,border-color,box-shadow,color,transform] duration-200 " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  // The app's own Sign in gradient, kept for the one action that leads there.
  primary: "gradient-button text-white shadow-[var(--shadow-card)] hover:brightness-110",
  secondary:
    "bg-surface text-foreground border border-line-strong hover:border-faint hover:bg-surface-sunken",
  ghost: "text-muted hover:text-foreground hover:bg-surface-sunken",
  onDark: "bg-white text-brand-800 hover:bg-brand-50",
  outlineOnDark: "border border-white/30 text-white hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-[0.86rem]",
  lg: "h-12 px-6 text-[0.94rem]",
};

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /**
   * Opens in a new tab and adds rel protection. Sign in never sets this — it is
   * the in-app path `/login`, which `next/link` should own. Kept for genuinely
   * outbound links.
   */
  external?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  className,
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        {/* A new tab is a surprise if you cannot see it happen. Sighted visitors
            get the context switch; this is the equivalent for anyone who does
            not, and it costs nothing visually. */}
        <span className="sr-only"> {NAV_COPY.newTab}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
