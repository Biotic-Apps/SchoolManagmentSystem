"use client";

import { Plus, Trash2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SkillSetupForm } from "../../use-skill-setup-form";

/** Rating levels, best first: a short code printed on the card and its meaning. */
export function SkillScaleEditor({ form }: { form: SkillSetupForm }) {
  const count = form.scale.length;
  return (
    <section className="flex flex-col gap-2">
      <SectionHeading
        title="Rating scale (best first)"
        actions={
          <Button variant="ghost" size="sm" onClick={form.addLevel} disabled={count >= 10}>
            <Plus />
            Add level
          </Button>
        }
      />
      <ul className="flex flex-col gap-1.5">
        {form.scale.map((level, index) => (
          <li key={level.key} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right text-caption text-fg-muted tabular-nums">{count - index}</span>
            <Input
              aria-label={`Code of level ${count - index}`}
              placeholder="A"
              value={level.code}
              maxLength={4}
              onChange={(event) => form.setLevel(level.key, { code: event.target.value })}
              className="h-9 w-20"
            />
            <Input
              aria-label={`Label of level ${count - index}`}
              placeholder="Excellent"
              value={level.label}
              maxLength={40}
              onChange={(event) => form.setLevel(level.key, { label: event.target.value })}
              className="h-9"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => form.removeLevel(level.key)}
              disabled={count <= 2}
              aria-label={`Remove level ${count - index}`}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
