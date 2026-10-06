"use client";

import { Download, FileText } from "lucide-react";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { useFileLink } from "../../use-payment-file";

interface FileLinkButtonProps {
  /** API path answering { fileUrl } or { jobId }, e.g. /payments/:id/receipt. */
  path: string;
  label: string;
  autoStart?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

/** Asks the API for a generated PDF, waits while it renders, then offers the download. */
export function FileLinkButton({ path, label, autoStart, variant = "secondary", size = "md" }: FileLinkButtonProps) {
  const file = useFileLink(path, autoStart);

  if (file.url) return <DownloadButton url={file.url} label={label} variant={variant} size={size} />;
  if (file.preparing) {
    return (
      <Button variant={variant} size={size} loading>
        Preparing…
      </Button>
    );
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant={variant} size={size} onClick={file.request}>
        {file.requested ? <Download /> : <FileText />}
        {file.failed ? "Try again" : label}
      </Button>
      {file.failed && <span className="text-caption text-error">The file is not ready yet. Try again shortly.</span>}
    </div>
  );
}
