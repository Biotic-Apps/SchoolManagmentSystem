"use client";

import { byOrder } from "../options";
import type { SyllabusPlan, Topic } from "../types";
import { TopicItem } from "./TopicItem";

interface PlanProgressViewProps {
  plan: SyllabusPlan;
  /** Omit for a read-only view (e.g. parents). */
  onUpdate?: (topic: Topic) => void;
}

/** Chapters → topics of a plan with target dates and progress badges. */
export function PlanProgressView({ plan, onUpdate }: PlanProgressViewProps) {
  if (plan.chapters.length === 0) return <p className="text-label text-fg-muted">This plan has no chapters yet.</p>;
  return (
    <ol className="flex flex-col gap-4">
      {byOrder(plan.chapters).map((chapter, index) => (
        <li key={chapter.id} className="flex flex-col gap-1">
          <h4 className="text-label font-semibold text-fg">
            {index + 1}. {chapter.title}
          </h4>
          <ul className="divide-y divide-border">
            {byOrder(chapter.topics).map((topic) => (
              <TopicItem key={topic.id} topic={topic} onUpdate={onUpdate} />
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
