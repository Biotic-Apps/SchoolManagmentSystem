import Link from "next/link";
import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Parent screens before any child link is verified. */
export function NoChildState({ description }: { description: string }) {
  return (
    <Card>
      <EmptyState
        icon={UserRound}
        title="No child linked yet"
        description={description}
        action={
          <Button asChild variant="secondary">
            <Link href="/profile">Go to Profile & Security</Link>
          </Button>
        }
      />
    </Card>
  );
}
