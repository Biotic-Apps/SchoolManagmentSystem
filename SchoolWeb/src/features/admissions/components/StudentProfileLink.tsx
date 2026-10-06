import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function StudentProfileLink({ studentId, size = "sm" }: { studentId: string; size?: "sm" | "md" }) {
  return (
    <Button asChild variant="secondary" size={size}>
      <Link href={`/students/${studentId}`}>
        <UserRound />
        Open student profile
      </Link>
    </Button>
  );
}
