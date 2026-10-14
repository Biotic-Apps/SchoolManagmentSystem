"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Wallet } from "lucide-react";
import { DeviceFrame } from "@/components/site/motion/DeviceFrame";
import { HERO_COPY } from "@/lib/site/content";
import { NotificationChip } from "./NotificationChip";
import { Orbit } from "./Orbit";
import { PhoneFrame } from "./PhoneFrame";
import { useHeroParallax } from "./useHeroParallax";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The layered product composition on the right of the hero: a tilted
 * dashboard, a phone on the parent portal overlapping its lower left, two
 * toasts that pop in one after the other, and the orbit turning behind it all.
 *
 * Each layer has a scroll speed (`data-speed`) and a mouse depth
 * (`data-depth`) of its own; see `useHeroParallax`.
 */
export function HeroVisual() {
  const root = useRef<HTMLDivElement>(null);
  useHeroParallax(root);

  return (
    <div ref={root} className="relative mx-auto w-full max-w-[640px] [perspective:1400px] lg:max-w-none">
      <div data-speed="12" className="[transform-style:preserve-3d] absolute -inset-[22%] hidden lg:block">
        <div data-depth="6" className="hero-depth size-full">
          <Orbit className="inset-0" />
        </div>
      </div>

      <div data-speed="24" className="[transform-style:preserve-3d] relative">
        <div data-depth="12" className="hero-depth">
          <motion.div
            data-motion
            initial={{ opacity: 0, y: 40, rotateX: 14 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
            className="[perspective:1200px]"
          >
            <div className="lg:[transform:rotateY(-9deg)_rotateX(5deg)_rotateZ(0.6deg)]">
              <DeviceFrame screen="dashboard" glow priority className="ml-auto w-[94%] lg:w-full" />
            </div>
          </motion.div>
        </div>
      </div>

      <div data-speed="56" className="[transform-style:preserve-3d] absolute -bottom-[40%] left-0 w-[22%] lg:-bottom-[30%] lg:-left-[9%] lg:w-[25%]">
        <div data-depth="26" className="hero-depth">
          <motion.div
            data-motion
            initial={{ opacity: 0, y: 60, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 1, delay: 0.7, ease: EASE }}
          >
            <PhoneFrame variant="parent" />
          </motion.div>
        </div>
      </div>

      <div data-speed="80" className="[transform-style:preserve-3d] absolute -top-[9%] right-0 lg:-right-[4%] lg:top-[8%]">
        <div data-depth="38" className="hero-depth">
          <NotificationChip
            icon={CalendarCheck}
            title={HERO_COPY.chipAttendance}
            meta={HERO_COPY.chipAttendanceMeta}
            delay={1.3}
            tone="brand"
            className="relative"
          />
        </div>
      </div>

      <div data-speed="68" className="[transform-style:preserve-3d] absolute -bottom-[26%] right-0 lg:-bottom-[6%] lg:right-[10%]">
        <div data-depth="32" className="hero-depth">
          <NotificationChip
            icon={Wallet}
            title={HERO_COPY.chipFee}
            meta={HERO_COPY.chipFeeMeta}
            delay={1.9}
            tone="accent"
            late
            className="relative"
          />
        </div>
      </div>
    </div>
  );
}
