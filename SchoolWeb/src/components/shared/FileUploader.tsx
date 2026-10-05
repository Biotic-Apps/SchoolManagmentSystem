"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImageUp, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FileUploaderProps {
  id?: string;
  accept: string[];
  maxSizeMb: number;
  previewUrl?: string | null;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onClear?: () => void;
  hint?: string;
}

function validate(file: File, accept: string[], maxSizeMb: number): string | null {
  if (!accept.includes(file.type)) return "This file type is not allowed.";
  if (file.size > maxSizeMb * 1024 * 1024) return `The file must be ${maxSizeMb} MB or smaller.`;
  return null;
}

export function FileUploader({ id, accept, maxSizeMb, previewUrl, uploading, onUpload, onClear, hint }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = validate(file, accept, maxSizeMb);
    setError(problem);
    if (!problem) onUpload(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-input border border-border bg-background">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs, not optimizable
            <img src={previewUrl} alt="" className="size-full object-contain" />
          ) : (
            <ImageUp className="size-5 text-fg-muted" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
            {previewUrl ? "Replace" : "Upload"}
          </Button>
          {previewUrl && onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} disabled={uploading}>
              <X />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={handleChange}
        />
      </div>
      {error ? (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      ) : (
        hint && <p className="text-caption text-fg-muted">{hint}</p>
      )}
    </div>
  );
}
