export interface TopicLike {
  status: string;
  targetDate: Date;
}

export interface ProgressSummary {
  total: number;
  completed: number;
  delayed: number;
  percent: number;
}

/** Past its target date and not completed. */
export function isDelayed(topic: TopicLike, today: Date): boolean {
  return topic.status !== 'COMPLETED' && topic.targetDate < today;
}

export function summarize(topics: TopicLike[], today: Date): ProgressSummary {
  const total = topics.length;
  const completed = topics.filter((t) => t.status === 'COMPLETED').length;
  const delayed = topics.filter((t) => isDelayed(t, today)).length;
  return {
    total,
    completed,
    delayed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
