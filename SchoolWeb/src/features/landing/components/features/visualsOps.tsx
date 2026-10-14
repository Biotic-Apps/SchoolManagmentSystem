import type { CSSProperties } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { MiniPill, MiniWindow } from "./MiniWindow";

// P = present, A = absent, L = leave — one dot per student.
const marks = "PPPPAPPPPPPLPPPPPPAPPPPPPPPPPP".split("");

export function OperationsVisual() {
  return (
    <MiniWindow
      title="Attendance · Class 4-B"
      badge={
        <MiniPill tone="muted">
          <WifiOff className="size-3" /> Offline
        </MiniPill>
      }
    >
      <div className="grid grid-cols-10 gap-1.5">
        {marks.map((m, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square rounded-full",
              m === "P" && "bg-primary/75",
              m === "A" && "bg-accent-pink",
              m === "L" && "bg-accent-cyan",
            )}
            style={{ animation: "rise-in 320ms var(--motion-ease-decelerate) backwards", animationDelay: `${120 + i * 18}ms` }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-caption">
        <span className="font-semibold text-fg">27 / 30 present</span>
        <span className="text-fg-muted">Syncs when online</span>
      </div>
    </MiniWindow>
  );
}

const bars = [42, 58, 50, 72, 64, 86];

export function FinanceVisual() {
  return (
    <MiniWindow title="Fee collection" badge={<MiniPill>86% collected</MiniPill>}>
      <div className="flex h-24 items-end gap-2">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn("animate-bar-grow flex-1 rounded-t-md", i === bars.length - 1 ? "bg-linear-to-t from-primary to-accent-pink" : "bg-primary/30")}
            style={{ height: `${h}%`, "--bar-delay": `${150 + i * 80}ms` } as CSSProperties}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2 text-center text-[10px] text-fg-muted">
        {["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </MiniWindow>
  );
}

const messages = [
  { from: "teacher", text: "Ayaan did great in today's maths quiz!" },
  { from: "parent", text: "Thank you! We'll keep practising at home." },
  { from: "teacher", text: "Homework for tomorrow is in the diary." },
];

export function CommunicationVisual() {
  return (
    <MiniWindow title="Messages · Class teacher" badge={<MiniPill tone="pink">New</MiniPill>}>
      <div className="flex flex-col gap-2">
        {messages.map((msg, i) => (
          <p
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-1.5 text-caption",
              msg.from === "parent" ? "self-end rounded-br-md bg-primary text-white" : "self-start rounded-bl-md bg-selected text-on-selected",
            )}
            style={{ animation: "rise-in 420ms var(--motion-ease-decelerate) backwards", animationDelay: `${200 + i * 160}ms` }}
          >
            {msg.text}
          </p>
        ))}
      </div>
    </MiniWindow>
  );
}
