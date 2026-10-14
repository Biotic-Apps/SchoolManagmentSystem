"use client";

import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/site/cn";
import { prefersReducedMotion } from "@/lib/site/gsap";

type MagneticLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** How far the button leans toward the cursor, as a share of the offset. */
  strength?: number;
};

/**
 * A link that leans toward the cursor while it is over it, then springs back.
 *
 * The transform is written straight to the element so a pointermove never
 * re-renders anything. Touch and reduced motion get an ordinary link.
 */
export function MagneticLink({ href, children, className, strength = 0.28 }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const node = ref.current;
    if (!node || event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const box = node.getBoundingClientRect();
    const x = (event.clientX - box.left - box.width / 2) * strength;
    const y = (event.clientY - box.top - box.height / 2) * strength * 1.3;
    node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-[0.94rem] font-semibold",
        "transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
