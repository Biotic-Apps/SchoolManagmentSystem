"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { classSetupHref } from "@/features/classes/links";
import { cn } from "@/lib/cn";
import type { BuilderLesson, TimetableBuilder } from "../builder-types";

function progress(lesson: BuilderLesson): { text: string; tone: string } {
  const target = lesson.periodsPerWeek;
  if (!target) return { text: `${lesson.placed}`, tone: "text-fg" };
  if (lesson.placed > target) return { text: `${lesson.placed}/${target}`, tone: "text-error font-semibold" };
  if (lesson.placed === target) return { text: `${lesson.placed}/${target}`, tone: "text-fg-muted" };
  return { text: `${lesson.placed}/${target}`, tone: "text-fg font-semibold" };
}

/** Placed vs required periods per subject ("English · Ms Sana · 4/6"); collapsible on phones. */
export function LessonsPanel({ builder }: { builder: TimetableBuilder }) {
  const { lessons, section } = builder;
  const teachersHref = classSetupHref(section.class.id, section.branchId, builder.timetable.sessionId, "teachers");
  const done = lessons.filter((lesson) => lesson.periodsPerWeek && lesson.placed >= lesson.periodsPerWeek).length;

  return (
    <details open className="group rounded-card border border-border bg-surface shadow-card lg:sticky lg:top-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 lg:cursor-default">
        <span className="text-label font-semibold text-fg">
          Lessons <span className="font-normal text-fg-muted">· {done}/{lessons.length} complete</span>
        </span>
        <ChevronDown className="size-4 text-fg-muted transition-transform group-open:rotate-180 lg:hidden" aria-hidden />
      </summary>
      {lessons.length === 0 ? (
        <p className="border-t border-border px-4 py-3 text-label text-fg-muted">
          No subjects in this class yet.{" "}
          <Link href={classSetupHref(section.class.id, section.branchId, builder.timetable.sessionId, "subjects")} className="text-primary underline">
            Add subjects
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {lessons.map((lesson) => {
            const status = progress(lesson);
            const complete = !!lesson.periodsPerWeek && lesson.placed === lesson.periodsPerWeek;
            return (
              <li key={lesson.subject.id} className={cn("flex items-center justify-between gap-2 px-4 py-2", complete && "opacity-70")}>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-label font-medium text-fg">{lesson.subject.name}</span>
                  {lesson.teacher ? (
                    <span className="truncate text-caption text-fg-muted">{lesson.teacher.name}</span>
                  ) : (
                    <Link href={teachersHref} className="text-caption font-medium text-warning underline">
                      No teacher
                    </Link>
                  )}
                </span>
                <span className={cn("text-label tabular-nums", status.tone)} aria-label={`${status.text} periods placed`}>
                  {status.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
}
