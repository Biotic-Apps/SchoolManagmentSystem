import { BellRing, CheckCircle2, ClipboardCheck, NotebookPen, Receipt, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { COMPARE_COPY as COPY } from "@/lib/site/content";
import { SceneTile } from "./SceneTile";

function Head({ icon: Icon, title, meta }: { icon: LucideIcon; title: string; meta?: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-4" strokeWidth={2.2} />
      </span>
      <p className="min-w-0 flex-1 truncate text-[0.86rem] font-semibold text-foreground">{title}</p>
      {meta}
    </div>
  );
}

/** The same school day on eSchool: four tidy cards in the same four places. */
export function ESchoolSide() {
  const { register, diary, receipt, call } = COPY.eschool;
  return (
    <div className="grid size-full gap-3 bg-surface-sunken p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
      <SceneTile tone="app">
        <Head icon={ClipboardCheck} title={register.title} />
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-line">
          <span className="w-[94%] bg-brand-500" />
          <span className="w-[6%] bg-accent-500" />
        </div>
        <div className="mt-2 flex justify-between text-[0.74rem] tabular-nums text-muted">
          <span>{register.present}</span>
          <span>{register.absent}</span>
        </div>
        <p className="mt-1 text-[0.7rem] text-faint">{register.note}</p>
      </SceneTile>

      <SceneTile tone="app">
        <Head icon={NotebookPen} title={diary.title} />
        <p className="mt-3 text-[0.82rem] text-muted">{diary.text}</p>
        <p className="mt-2 text-[0.72rem] font-medium text-brand-600">{diary.seen}</p>
      </SceneTile>

      <SceneTile tone="app">
        <Head
          icon={Receipt}
          title={receipt.title}
          meta={
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.66rem] font-semibold text-emerald-700">
              <CheckCircle2 className="size-3" />
              {receipt.status}
            </span>
          }
        />
        <p className="mt-3 text-[0.82rem] tabular-nums text-muted">{receipt.text}</p>
      </SceneTile>

      <SceneTile tone="app">
        <Head icon={BellRing} title={call.title} />
        <p className="mt-3 text-[0.82rem] text-muted">{call.text}</p>
      </SceneTile>
    </div>
  );
}
