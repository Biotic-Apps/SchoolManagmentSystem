import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { http } from "@/lib/http";

export interface MessageRecipient {
  userId: string;
  name: string;
  role: "CLASS_TEACHER" | "SUBJECT_TEACHER" | "PRINCIPAL";
  subjectName?: string;
}

const ROLE_LABEL: Record<MessageRecipient["role"], string> = {
  CLASS_TEACHER: "Class teacher",
  SUBJECT_TEACHER: "Teacher",
  PRINCIPAL: "Principal",
};

/** Staff a parent may message about this child (class teacher, subject teachers, principal). */
export function useMessageRecipients(studentId: string | null) {
  return useQuery({
    queryKey: ["messages", "recipients", studentId],
    queryFn: async () =>
      (await http.get<MessageRecipient[]>("/messages/recipients", { studentId: studentId ?? "" })).data,
    enabled: !!studentId,
  });
}

export function recipientOptions(recipients: MessageRecipient[] | undefined): Option[] {
  return (recipients ?? []).map((r) => ({
    id: r.userId,
    name: `${r.name} (${r.subjectName ? r.subjectName : ROLE_LABEL[r.role]})`,
  }));
}
