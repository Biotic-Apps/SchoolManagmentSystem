"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ANDROID_APP_COPY as COPY } from "@/lib/site/content";
import { FloatingPhone } from "./FloatingPhone";
import { SyncChip } from "./SyncChip";
import { SyncedToast } from "./SyncedToast";
import { useSyncCycle } from "./useSyncCycle";

/**
 * Two phones, the teacher's register in front and the parent's home behind,
 * at different angles. On small screens only the teacher's phone shows,
 * centred. The sync chips float over the front phone.
 */
export function AppPhones() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const { phase, pending } = useSyncCycle(inView && !reduced);

  return (
    <div
      ref={box}
      role="img"
      aria-label={COPY.visualLabel}
      className="relative mx-auto h-[460px] w-full max-w-[320px] sm:h-[560px] sm:max-w-[520px]"
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(196_181_253/0.35),transparent_68%)] sm:size-[480px]"
      />
      <FloatingPhone
        variant="parent"
        tilt={8}
        duration={7}
        delay={0.8}
        className="absolute right-[2%] top-0 hidden w-[230px] sm:block"
      />
      <FloatingPhone
        variant="attendance"
        tilt={-6}
        className="absolute left-1/2 top-4 w-[190px] -translate-x-1/2 sm:left-[6%] sm:top-12 sm:w-[240px] sm:translate-x-0"
      />
      <div aria-hidden>
        <SyncChip
          phase={phase}
          pending={pending}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 sm:left-0 sm:translate-x-0"
        />
        <SyncedToast
          show={phase === "synced"}
          className="absolute right-0 top-[40%] sm:right-[2%] sm:top-[52%]"
        />
      </div>
    </div>
  );
}
