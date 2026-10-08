"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/error-messages";
import { useRenameClass } from "../../setup-api";

interface ClassNameEditorProps {
  classId: string;
  name: string;
  canEdit: boolean;
}

/** Class name as the page title; the pencil turns it into a field (Enter saves, Esc cancels). */
export function ClassNameEditor({ classId, name, canEdit }: ClassNameEditorProps) {
  const rename = useRenameClass(classId);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const value = text?.trim() ?? "";
    if (!value || value === name) return setText(null);
    try {
      await rename.mutateAsync(value);
      setText(null);
      setError(null);
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  if (text === null) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="truncate text-[24px] font-semibold leading-8 tracking-tight text-fg sm:text-page-title">{name}</h1>
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={() => setText(name)} aria-label="Rename class">
            <Pencil />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          aria-label="Class name"
          value={text}
          maxLength={40}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void save();
            if (event.key === "Escape") setText(null);
          }}
          className="h-10 max-w-xs text-card-title font-semibold"
        />
        <Button size="sm" className="h-10" onClick={() => void save()} loading={rename.isPending}>
          Save
        </Button>
        <Button variant="ghost" size="sm" className="h-10" onClick={() => setText(null)}>
          Cancel
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}
