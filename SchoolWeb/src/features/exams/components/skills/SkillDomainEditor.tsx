"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { OrderButtons } from "@/components/shared/OrderButtons";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SkillDomain } from "../../skill-types";
import type { SkillSetupForm } from "../../use-skill-setup-form";

interface SkillDomainEditorProps {
  domain: SkillDomain;
  title: string;
  form: SkillSetupForm;
}

/** The items of one domain: rename, reorder, remove, add. */
export function SkillDomainEditor({ domain, title, form }: SkillDomainEditorProps) {
  const [draft, setDraft] = useState("");
  const items = form.domainItems(domain);
  const add = () => {
    if (draft.trim().length < 2) return;
    form.addItem(domain, draft);
    setDraft("");
  };

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading title={title} />
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li key={item.key} className="flex items-center gap-2">
            <Input
              aria-label={`${title} item ${index + 1}`}
              value={item.name}
              maxLength={60}
              onChange={(event) => form.renameItem(item.key, event.target.value)}
              className="h-9"
            />
            <OrderButtons
              label={item.name || `item ${index + 1}`}
              index={index}
              count={items.length}
              onMove={(from, to) => form.moveItem(domain, from, to)}
              onRemove={() => form.removeItem(item.key)}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <Input
          aria-label={`New ${title} item`}
          placeholder="Add an item, e.g. Leadership"
          value={draft}
          maxLength={60}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            add();
          }}
          className="h-9"
        />
        <Button variant="secondary" size="sm" onClick={add} disabled={draft.trim().length < 2}>
          <Plus />
          Add
        </Button>
      </div>
    </section>
  );
}
