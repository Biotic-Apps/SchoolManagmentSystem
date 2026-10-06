import { useMemo } from "react";
import { useTeacherToday } from "./api";
import type { TeacherToday } from "./types";
import { useMenuIds } from "./use-menu-ids";

const UNKNOWN_SECTION = "Section";

/** Section / subject names come from today's periods when the API sends only ids. */
function nameMaps(data: TeacherToday | undefined) {
  const sections = new Map<string, string>();
  const subjects = new Map<string, string>();
  for (const slot of data?.periods ?? []) {
    sections.set(slot.section.id, `${slot.section.className} ${slot.section.name}`);
    subjects.set(slot.subject.id, slot.subject.name);
  }
  return { sections, subjects };
}

function joinName(className?: string | null, sectionName?: string | null): string | null {
  return [className, sectionName].filter(Boolean).join(" ") || null;
}

export function useTeacherTodayPanel() {
  const menu = useMenuIds();
  const query = useTeacherToday(true);
  const data = query.data;

  return useMemo(() => {
    const names = nameMaps(data);
    const sectionName = (id: string, className?: string | null, name?: string | null) =>
      joinName(className, name) ?? names.sections.get(id) ?? UNKNOWN_SECTION;
    return {
      query,
      periods: [...(data?.periods ?? [])].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      registers: (data?.registers ?? []).map((item) => ({
        ...item,
        label: sectionName(item.sectionId, item.className, item.sectionName),
      })),
      diaries: (data?.diariesPending ?? []).map((item) => ({
        key: `${item.sectionId}:${item.subjectId}`,
        section: sectionName(item.sectionId, item.className, item.sectionName),
        subject: item.subjectName ?? names.subjects.get(item.subjectId) ?? null,
      })),
      unreadMessages: data?.unreadMessages ?? 0,
      assignedComplaints: data?.assignedComplaints ?? 0,
      links: {
        attendance: menu.has("attendance") ? "/attendance" : null,
        diary: menu.has("diary") ? "/diary" : null,
        messages: menu.has("messages") ? "/messages" : null,
        complaints: menu.has("complaints") ? "/complaints" : null,
        timetable: menu.has("timetable") ? "/timetable" : null,
      },
    };
  }, [data, query, menu]);
}

export type TeacherTodayState = ReturnType<typeof useTeacherTodayPanel>;
