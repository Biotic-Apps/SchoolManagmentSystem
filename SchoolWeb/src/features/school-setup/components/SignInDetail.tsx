import { CopyButton } from "@/components/shared/CopyButton";

export function SignInDetail({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption text-fg-muted">{label}</span>
      <div className="flex items-center gap-2 rounded-input border border-border bg-background px-3 py-1.5">
        <code className={secret ? "flex-1 select-all break-all font-mono text-body font-semibold text-fg" : "flex-1 break-all text-body text-fg"}>
          {value}
        </code>
        <CopyButton text={value} aria-label={`Copy ${label.toLowerCase()}`} />
      </div>
    </div>
  );
}
