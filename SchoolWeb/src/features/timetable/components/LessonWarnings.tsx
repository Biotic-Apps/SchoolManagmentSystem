import { InlineNotice } from "@/components/shared/InlineNotice";
import type { LessonDialogState } from "../use-lesson-dialog";

/** Instant clash hints from other sections' lessons at this time (published ones block publishing). */
export function LessonWarnings({ dialog }: { dialog: LessonDialogState }) {
  const { teacherBusy, roomBusy, otherTeacher, lesson } = dialog;
  if (!teacherBusy && !roomBusy && !otherTeacher) return null;
  return (
    <div className="flex flex-col gap-2">
      {teacherBusy && (
        <InlineNotice tone={teacherBusy.published ? "error" : "warning"}>
          {dialog.teacherName || "This teacher"} already teaches {teacherBusy.sectionName} at this time
          {teacherBusy.published ? "." : " (in a draft)."}
        </InlineNotice>
      )}
      {roomBusy && (
        <InlineNotice tone={roomBusy.published ? "error" : "warning"}>
          This room is used by {roomBusy.sectionName} at this time{roomBusy.published ? "." : " (in a draft)."}
        </InlineNotice>
      )}
      {otherTeacher && lesson && (
        <InlineNotice tone="warning">
          {otherTeacher.name} teaches {lesson.subject.name} in this section. This lesson is flagged until the teacher matches;
          change it in Class setup if needed.
        </InlineNotice>
      )}
    </div>
  );
}
