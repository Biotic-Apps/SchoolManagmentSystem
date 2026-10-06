import { Download } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";

interface DownloadButtonProps {
  url: string | null | undefined;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

/** Opens a signed file URL (PDF, receipt, export); disabled until the file exists. */
export function DownloadButton({ url, label = "Download", variant = "secondary", size = "md" }: DownloadButtonProps) {
  if (!url) {
    return (
      <Button variant={variant} size={size} disabled>
        <Download />
        {label}
      </Button>
    );
  }
  return (
    <Button asChild variant={variant} size={size}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Download />
        {label}
      </a>
    </Button>
  );
}
