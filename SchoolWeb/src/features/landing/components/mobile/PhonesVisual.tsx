import { CheckCircle2 } from "lucide-react";
import { Reveal } from "../Reveal";
import { PhoneMockup } from "./PhoneMockup";
import { PhoneScreenAttendance } from "./PhoneScreenAttendance";
import { PhoneScreenParent } from "./PhoneScreenParent";

/** Two overlapping phones (parent behind, teacher in front) + a "synced" chip. Phones show only the front one. */
export function PhonesVisual() {
  return (
    <div className="relative mx-auto flex w-full max-w-[460px] justify-center pb-6 lg:justify-end">
      <div className="absolute left-0 top-10 hidden -rotate-[8deg] lg:block">
        <PhoneMockup time="9:38 AM" className="animate-float-delayed origin-top-left scale-90 opacity-90">
          <PhoneScreenParent />
        </PhoneMockup>
      </div>

      <div className="relative z-10 lg:mr-2">
        <PhoneMockup className="animate-float">
          <PhoneScreenAttendance />
        </PhoneMockup>
      </div>

      <div className="absolute inset-x-0 -bottom-7 z-20 flex justify-center lg:left-auto lg:right-[110px]">
        <Reveal from="right" delay={500}>
          <div className="landing-glass flex items-center gap-2 rounded-full px-3.5 py-2 text-label font-semibold text-fg shadow-overlay">
            <CheckCircle2 className="size-4 text-primary" />
            Synced ✓ 34 records
          </div>
        </Reveal>
      </div>
    </div>
  );
}
