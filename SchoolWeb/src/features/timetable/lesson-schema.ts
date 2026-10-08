import { z } from "zod";

export const lessonSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject"),
  staffId: z.string().min(1, "Choose a teacher"),
  roomId: z.string(),
  allocate: z.boolean(),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;
