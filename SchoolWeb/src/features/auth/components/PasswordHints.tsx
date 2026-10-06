import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { PASSWORD_HINTS } from "../password-hints";

/** Live checklist of the password policy under a new-password field. */
export function PasswordHints({ value }: { value: string }) {
  return (
    <ul className="flex flex-col gap-1" aria-label="Password rules">
      {PASSWORD_HINTS.map((hint) => {
        const met = hint.test(value);
        const Icon = met ? Check : Circle;
        return (
          <li key={hint.id} className={cn("flex items-center gap-2 text-caption", met ? "text-success" : "text-fg-muted")}>
            <Icon className="size-3.5 shrink-0" aria-hidden />
            <span>{hint.label}</span>
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
      <li className="text-caption text-fg-muted">Common passwords such as Password1 are refused.</li>
    </ul>
  );
}
