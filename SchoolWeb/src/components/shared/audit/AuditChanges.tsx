"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AuditChange } from "@/lib/audit/diff";
import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui/styles";

const LONG_TEXT = 120;

function ToggleButton({ open, onClick, children }: { open: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={cn("inline-flex items-center gap-1 rounded-sm text-caption font-medium text-primary hover:underline", focusRing)}
    >
      {children}
      <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-180")} />
    </button>
  );
}

function LongText({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  if (text.length <= LONG_TEXT) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {open ? text : `${text.slice(0, LONG_TEXT).trimEnd()}…`}{" "}
      <ToggleButton open={open} onClick={() => setOpen(!open)}>
        {open ? "Show less" : "Show more"}
      </ToggleButton>
    </span>
  );
}

function RowList({ title, rows }: { title?: string; rows: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      {title && <p className="text-caption font-medium text-fg-muted">{title}</p>}
      <ul className="flex flex-col gap-1">
        {rows.map((row, index) => (
          <li key={index} className="break-words rounded-md bg-surface px-2.5 py-1.5 text-caption text-fg">
            {row}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Details({ before, after }: NonNullable<AuditChange["details"]>) {
  const [open, setOpen] = useState(false);
  if (!before.length && !after.length) return null;
  const both = before.length > 0 && after.length > 0;
  return (
    <div className="flex flex-col gap-2">
      <div>
        <ToggleButton open={open} onClick={() => setOpen(!open)}>
          {open ? "Hide details" : "Show details"}
        </ToggleButton>
      </div>
      {open && (
        <div className="flex flex-col gap-3">
          {after.length > 0 && <RowList title={both ? "Now" : undefined} rows={after} />}
          {before.length > 0 && <RowList title={after.length ? "Before" : "Removed"} rows={before} />}
        </div>
      )}
    </div>
  );
}

function ChangeRow({ change }: { change: AuditChange }) {
  const { label, from, to, details } = change;
  return (
    <li className="flex flex-col gap-1">
      <p className="break-words text-caption leading-5">
        <span className="font-medium text-fg">{label}: </span>
        {from !== null && to !== null ? (
          <>
            <LongText text={from} className="text-fg-muted" />
            <span aria-label="changed to" className="mx-1 text-fg-muted">→</span>
            <LongText text={to} className="text-fg" />
          </>
        ) : (
          <LongText text={to ?? from ?? ""} className={to === null ? "text-fg-muted line-through" : "text-fg"} />
        )}
      </p>
      {details && <Details {...details} />}
    </li>
  );
}

/** Readable field changes of one audit entry. */
export function AuditChanges({ changes }: { changes: AuditChange[] }) {
  if (!changes.length) return null;
  return (
    <ul className="flex flex-col gap-1.5 rounded-input bg-background px-3 py-2.5">
      {changes.map((change) => (
        <ChangeRow key={change.key} change={change} />
      ))}
    </ul>
  );
}
