import { SectionHeading } from "@/components/shared/SectionHeading";
import { textOrDash } from "@/lib/format";

interface TextBlockProps {
  title: string;
  text: string | null | undefined;
  caption?: string;
}

/** Headed paragraph of free text (keeps the author's line breaks). */
export function TextBlock({ title, text, caption }: TextBlockProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <SectionHeading title={title} />
      <p className="whitespace-pre-line break-words text-label text-fg">{textOrDash(text)}</p>
      {caption && <span className="text-caption text-fg-muted">{caption}</span>}
    </div>
  );
}
