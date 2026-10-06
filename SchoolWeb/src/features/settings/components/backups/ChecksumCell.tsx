"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EMPTY_VALUE } from "@/lib/format";
import { toast } from "@/lib/toast";

export function ChecksumCell({ value }: { value: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <>{EMPTY_VALUE}</>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy the checksum");
    }
  };

  return (
    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <code className="font-mono text-caption text-fg" title={value}>
        {value.slice(0, 12)}
      </code>
      <Button variant="ghost" size="sm" onClick={copy} aria-label="Copy full checksum" title="Copy full checksum">
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}
