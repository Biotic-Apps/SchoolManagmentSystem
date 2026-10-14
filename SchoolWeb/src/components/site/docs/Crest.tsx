import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/site/cn";

/** The demo school's crest: a purple shield-like tile with a cap. */
export function Crest({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[30%] bg-[linear-gradient(150deg,#7b68ee,#4c3d99)] text-white ring-2 ring-brand-100",
        className,
      )}
    >
      <GraduationCap style={{ width: size * 0.58, height: size * 0.58 }} strokeWidth={2.2} />
    </span>
  );
}
