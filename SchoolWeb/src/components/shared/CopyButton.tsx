"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  text: string;
  /** Visible text next to the icon; icon-only when omitted. */
  label?: string;
}

/** Copies text to the clipboard and shows a tick for a moment. */
export function CopyButton({ text, label, variant = "ghost", size = "sm", ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it by hand.");
    }
  };

  return (
    <Button variant={variant} size={size} onClick={copy} aria-label={label ? undefined : copied ? "Copied" : "Copy"} {...props}>
      {copied ? <Check /> : <Copy />}
      {label && (copied ? "Copied" : label)}
    </Button>
  );
}
