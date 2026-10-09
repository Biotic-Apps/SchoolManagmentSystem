import Link from "next/link";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { useCan } from "@/features/auth/use-can";

interface GuardianReachNoticeProps {
  message: string | null;
  studentId: string | null;
}

/** Shown under the student field when no guardian can receive the message. */
export function GuardianReachNotice({ message, studentId }: GuardianReachNoticeProps) {
  const can = useCan();
  if (!message) return null;
  return (
    <InlineNotice tone="warning">
      {message}
      {studentId && can("guardians.edit") && (
        <>
          {" "}
          <Link href={`/students/${studentId}`} className="font-medium underline">
            Open the student’s Guardians tab
          </Link>
        </>
      )}
    </InlineNotice>
  );
}
