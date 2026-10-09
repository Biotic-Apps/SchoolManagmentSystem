"use client";

import type { LucideIcon } from "lucide-react";
import { Printer } from "lucide-react";
import type { ReactNode } from "react";
import { PdfJobStatus } from "@/components/shared/PdfJobStatus";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

interface PrintActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Pickers for what to print. */
  children: ReactNode;
  /** Why printing is not possible yet (replaces the button). */
  blocked?: string | null;
  pending: boolean;
  jobId: string | null;
  onPrint: () => void;
  jobLabel: string;
  downloadLabel: string;
  unit?: string;
}

/** One bulk print: pick the scope, generate in the background, download. */
export function PrintActionCard(props: PrintActionCardProps) {
  const Icon = props.icon;
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {props.children}
        {props.blocked ? (
          <p className="text-caption text-fg-muted">{props.blocked}</p>
        ) : (
          <Button variant="secondary" className="self-start" onClick={props.onPrint} loading={props.pending}>
            <Printer />
            Generate PDF
          </Button>
        )}
        <PdfJobStatus
          jobId={props.jobId}
          label={props.jobLabel}
          downloadLabel={props.downloadLabel}
          unit={props.unit}
        />
      </CardContent>
    </Card>
  );
}
