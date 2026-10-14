import { cn } from "@/lib/site/cn";
import { Rail } from "./chrome/Rail";
import { TopBar } from "./chrome/TopBar";
import { AcademicsScreen } from "./screens/AcademicsScreen";
import { AttendanceScreen } from "./screens/AttendanceScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { FeesScreen } from "./screens/FeesScreen";
import { ParentScreen } from "./screens/ParentScreen";
import type { ScreenVariant } from "./types";

export type { ScreenVariant } from "./types";

/**
 * A rebuild of eSchool's own portal screens, used wherever a real screenshot
 * has not been dropped into `public/screens/` yet.
 *
 * The aim is fidelity, not decoration: every row carries plausible school
 * data, numbers are right-aligned and tabular, and separation is by hairline
 * rather than by shadow, exactly as it is in the application.
 *
 * Everything sizes in `em` against a root font-size expressed in `cqw`, so the
 * whole screen scales with its container and keeps its proportions at any width.
 */
const SCREENS: Record<
  ScreenVariant,
  { title: string; crumb: string; branch?: string; Body: () => React.JSX.Element }
> = {
  dashboard: { title: "Principal dashboard", crumb: "Home", Body: DashboardScreen },
  attendance: { title: "Student attendance", crumb: "Attendance", Body: AttendanceScreen },
  academics: { title: "Exams & results", crumb: "Academics", Body: AcademicsScreen },
  fees: { title: "Fee challans", crumb: "Fees", Body: FeesScreen },
  parent: { title: "Good morning, Ayesha", crumb: "Parent portal", branch: "Sara Khan · 5-A", Body: ParentScreen },
};

export function ScreenMock({
  variant = "dashboard",
  className,
}: {
  variant?: ScreenVariant;
  className?: string;
}) {
  const { title, crumb, branch, Body } = SCREENS[variant];

  return (
    <div className={cn("@container size-full bg-white", className)}>
      <div
        className="flex size-full font-sans text-slate-700"
        // Root size follows the container width, down to an 11px floor below
        // which it stops scaling and crops instead: a cropped screen that can
        // be read says more than a whole one that cannot — and it is what the
        // real screenshots do under `object-cover object-top`.
        style={{ fontSize: "clamp(11px, 1.05cqw, 14px)" }}
      >
        <Rail variant={variant} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar title={title} crumb={crumb} branch={branch} />
          <Body />
        </div>
      </div>
    </div>
  );
}
