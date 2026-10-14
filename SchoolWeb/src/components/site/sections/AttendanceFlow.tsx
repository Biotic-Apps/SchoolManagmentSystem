"use client";

import { Fragment, useCallback, useRef, useState } from "react";
import {
  ClipboardCheck,
  LayoutDashboard,
  MessageSquareText,
  WifiOff,
} from "lucide-react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { FLOW_COPY } from "@/lib/site/content";
import { StepCard } from "@/components/site/showcase/flow/StepCard";
import { TeacherRegister } from "@/components/site/showcase/flow/TeacherRegister";
import { ParentMessage } from "@/components/site/showcase/flow/ParentMessage";
import { PrincipalDashboard } from "@/components/site/showcase/flow/PrincipalDashboard";
import { RowConnector } from "@/components/site/showcase/flow/RowConnector";
import { StackConnector } from "@/components/site/showcase/flow/StackConnector";
import { FlowStage } from "@/components/site/showcase/flow/FlowStage";
import { useFlowScroll } from "@/components/site/showcase/flow/useFlowScroll";

const STAGES = [
  {
    icon: ClipboardCheck,
    label: FLOW_COPY.steps.teacher,
    Body: TeacherRegister,
  },
  {
    icon: MessageSquareText,
    label: FLOW_COPY.steps.parent,
    Body: ParentMessage,
  },
  {
    icon: LayoutDashboard,
    label: FLOW_COPY.steps.principal,
    Body: PrincipalDashboard,
  },
] as const;

/**
 * One register, three people informed: teacher, parent, principal. On a
 * desktop the stages sit in a row and, as the row scrolls past, a line draws
 * itself from each to the next and the stage it reaches plays. Below `lg` they
 * stack and play as each comes into view. Nothing is pinned.
 */
export function AttendanceFlow() {
  const row = useRef<HTMLDivElement>(null);
  const paths = useRef<Array<SVGPathElement | null>>([]);
  const dots = useRef<Array<SVGGElement | null>>([]);
  /** 0 = waiting, 1..3 = the stage currently reached. */
  const [step, setStep] = useState(0);
  const onSeen = useCallback(
    (index: number) => setStep((s) => Math.max(s, index + 1)),
    [],
  );

  useFlowScroll({ row, paths, dots, setStep });

  return (
    <Section id="attendance-flow" className="overflow-x-clip">
      <SectionHeading
        eyebrow={FLOW_COPY.eyebrow}
        title={FLOW_COPY.title}
        body={FLOW_COPY.body}
      />

      <div
        ref={row}
        className="mx-auto mt-14 flex max-w-xl flex-col lg:mt-16 lg:max-w-none lg:flex-row lg:items-stretch"
      >
        {STAGES.map(({ icon, label, Body }, index) => (
          <Fragment key={label}>
            {index > 0 ? (
              <>
                <div className="hidden lg:flex">
                  <RowConnector
                    pathRef={(node) => {
                      paths.current[index - 1] = node;
                    }}
                    dotRef={(node) => {
                      dots.current[index - 1] = node;
                    }}
                  />
                </div>
                <div className="lg:hidden">
                  <StackConnector />
                </div>
              </>
            ) : null}
            <div className="min-w-0 lg:flex-1">
              <FlowStage index={index} onSeen={onSeen}>
                <StepCard
                  index={index + 1}
                  step={step}
                  icon={icon}
                  label={label}
                >
                  <Body step={step} />
                </StepCard>
              </FlowStage>
            </div>
          </Fragment>
        ))}
      </div>

      <Reveal>
        <p className="mx-auto mt-10 flex max-w-2xl items-start gap-2 rounded-card bg-info-soft p-3 text-[0.82rem] leading-relaxed text-muted">
          <WifiOff className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
          {FLOW_COPY.offlineNote}
        </p>
      </Reveal>
    </Section>
  );
}
