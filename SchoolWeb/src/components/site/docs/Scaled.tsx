import type { ReactNode } from "react";

/** Reserves the scaled footprint of a fixed-size drawing and shrinks it into it. */
export function Scaled({ w, h, scale, children }: { w: number; h: number; scale: number; children: ReactNode }) {
  return (
    <div style={{ width: w * scale, height: h * scale }} className="relative shrink-0">
      <div style={{ width: w, height: h, transform: `scale(${scale})` }} className="absolute left-0 top-0 origin-top-left">
        {children}
      </div>
    </div>
  );
}
