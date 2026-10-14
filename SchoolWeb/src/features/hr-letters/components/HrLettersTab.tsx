"use client";

import { FileText, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/features/auth/session-context";
import { useStaffHrLetters, useHrLetterTemplates } from "../api";
import { GenerateLetterDialog } from "./GenerateLetterDialog";
import { HrLetterCard } from "./HrLetterCard";

interface HrLettersTabProps {
  staffId: string;
  canGenerate: boolean;
}

export function HrLettersTab({ staffId, canGenerate }: HrLettersTabProps) {
  const { session } = useSession();
  const [showDialog, setShowDialog] = useState(false);

  // Derive schoolId from the active assignment.
  const schoolId = useMemo(() => {
    for (const a of session?.assignments ?? []) {
      if (a.role === session?.activeRole && a.schoolId) return a.schoolId;
    }
    return null;
  }, [session]);

  const lettersQuery = useStaffHrLetters(staffId);
  const templatesQuery = useHrLetterTemplates({ schoolId, status: "ACTIVE" }, !!schoolId);
  const letters = lettersQuery.data ?? [];
  const templates = templatesQuery.data?.data ?? [];

  if (lettersQuery.isLoading) return <Skeleton className="h-32 w-full" />;
  if (lettersQuery.error) return <ErrorState error={lettersQuery.error} onRetry={() => lettersQuery.refetch()} />;

  const handleSaved = () => {
    setShowDialog(false);
  };

  const generateButton = canGenerate && templates.length > 0 && (
    <Button onClick={() => setShowDialog(true)}>
      <Plus className="h-4 w-4" />
      Generate letter
    </Button>
  );

  if (letters.length === 0) {
    return (
      <>
        <EmptyState
          icon={FileText}
          title="No HR letters yet"
          description={canGenerate ? "Generate experience, salary or relieving letters for this staff member." : "No HR letters have been issued yet."}
          action={generateButton}
        />
        {showDialog && (
          <GenerateLetterDialog
            staffId={staffId}
            templates={templates}
            onClose={() => setShowDialog(false)}
            onSaved={handleSaved}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-body font-medium text-fg">HR Letters ({letters.length})</h3>
        {generateButton}
      </div>
      <div className="flex flex-col gap-3">
        {letters.map((letter) => (
          <HrLetterCard key={letter.id} letter={letter} />
        ))}
      </div>
      {showDialog && (
        <GenerateLetterDialog
          staffId={staffId}
          templates={templates}
          onClose={() => setShowDialog(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
