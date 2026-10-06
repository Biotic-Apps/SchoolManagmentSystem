"use client";

import { Pencil } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import type { Topic } from "../types";

interface TopicItemProps {
  topic: Topic;
  onUpdate?: (topic: Topic) => void;
}

export function TopicItem({ topic, onUpdate }: TopicItemProps) {
  return (
    <li className="flex flex-col gap-2 py-2.5 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-label text-fg">{topic.title}</span>
        <span className="text-caption text-fg-muted">
          Target {formatDate(topic.targetDate)}
          {topic.completedOn && ` · Completed ${formatDate(topic.completedOn)}`}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={topic.status} />
        {topic.isDelayed && <Badge tone="error">Delayed</Badge>}
        {topic.pendingReview && <Badge tone="warning">Pending review</Badge>}
        {onUpdate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate(topic)}
            disabled={topic.pendingReview}
            aria-label={`Update progress of ${topic.title}`}
            title={topic.pendingReview ? "A change is waiting for review" : undefined}
          >
            <Pencil />
          </Button>
        )}
      </div>
    </li>
  );
}
