import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/cn";

interface AppLogoProps {
  className?: string;
  showName?: boolean;
  subtitle?: string;
}

export function AppLogo({ className, showName = true, subtitle }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-[linear-gradient(140deg,#9B8BF4,#7B68EE_55%,#6A5ACD)] text-on-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_6px_-2px_rgb(123_104_238/0.55)]">
        <GraduationCap className="size-5" />
      </span>
      {showName && (
        <span className="flex flex-col leading-tight">
          <span className="text-body font-semibold text-fg">eSchool</span>
          {subtitle && <span className="text-caption text-fg-muted">{subtitle}</span>}
        </span>
      )}
    </div>
  );
}
