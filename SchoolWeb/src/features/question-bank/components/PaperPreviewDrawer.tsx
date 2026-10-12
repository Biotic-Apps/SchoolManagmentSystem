"use client";

import { Download } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/config/env";
import { getAccessToken, getActiveRoleHeader } from "@/lib/request-context";
import type { ExamPaper } from "../types";

interface PaperPreviewDrawerProps {
  paper: ExamPaper;
  onClose: () => void;
}

async function downloadPdf(paperId: string) {
  const token = getAccessToken();
  const role = getActiveRoleHeader();
  const headers: Record<string, string> = { Accept: "application/pdf" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (role) headers["X-Active-Role"] = role;
  const response = await fetch(`${API_URL}/exam-papers/${paperId}/pdf`, { headers });
  if (!response.ok) return;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exam-paper-${paperId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PaperPreviewDrawer({ paper, onClose }: PaperPreviewDrawerProps) {
  return (
    <DetailDrawer open onOpenChange={(open) => !open && onClose()} title={paper.title}>
      <DetailList
        items={[
          { label: "Subject", value: paper.subject?.name ?? "-" },
          { label: "Class", value: paper.class?.name ?? "-" },
          { label: "Total Marks", value: String(paper.totalMarks) },
          { label: "Duration", value: `${paper.duration} minutes` },
          { label: "Status", value: <StatusBadge status={paper.status} /> },
        ]}
      />
      <div className="mt-4">
        <SectionHeading title="Sections" />
        {paper.sections.map((section, i) => (
          <div key={i} className="mb-3 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">{section.title}</p>
            <p className="text-caption text-fg-muted">
              {section.questionIds.length} questions &middot; {section.marks} marks
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <Button onClick={() => downloadPdf(paper.id)}>
          <Download className="mr-1 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </DetailDrawer>
  );
}
