import { useState } from "react";
import { errorWithDetails } from "@/lib/error-messages";
import { useSaveSkillConfig, useSkillConfig } from "./skills-api";
import type { SkillConfig, SkillDomain } from "./skill-types";

export interface SetupItem {
  key: string;
  id?: string;
  domain: SkillDomain;
  name: string;
}

export interface SetupLevel {
  key: string;
  code: string;
  label: string;
}

let seq = 0;
const nextKey = () => `new-${++seq}`;

interface SetupDraft {
  items: SetupItem[];
  scale: SetupLevel[];
}

function fromConfig(config: SkillConfig | undefined): SetupDraft {
  return {
    items: (config?.items ?? []).map((item) => ({ key: item.id, id: item.id, domain: item.domain, name: item.name })),
    // Highest first, as the API sends it.
    scale: (config?.scale ?? []).map((level) => ({ key: String(level.value), code: level.code, label: level.label })),
  };
}

/** Problems that block saving (also checked by the API). */
export function setupProblems(items: SetupItem[], scale: SetupLevel[]): string[] {
  const problems: string[] = [];
  const names = items.map((item) => `${item.domain}:${item.name.trim().toLowerCase()}`);
  if (items.some((item) => item.name.trim().length < 2)) problems.push("Each item needs a name of 2+ letters.");
  if (new Set(names).size !== names.length) problems.push("An item is listed twice.");
  if (scale.length < 2) problems.push("The scale needs at least 2 levels.");
  if (scale.some((level) => !level.code.trim() || !level.label.trim())) problems.push("Each level needs a code and a label.");
  const codes = scale.map((level) => level.code.trim().toUpperCase());
  if (new Set(codes).size !== codes.length) problems.push("Level codes must differ.");
  return problems;
}

/** Items & scale editor of a branch; starts from the saved setup. */
export function useSkillSetupForm(branchId: string, onDone: () => void) {
  const query = useSkillConfig(branchId);
  const save = useSaveSkillConfig(branchId);
  const [draft, setDraft] = useState<SetupDraft | null>(null);
  const value = draft ?? fromConfig(query.data);
  const edit = (next: Partial<SetupDraft>) => setDraft({ ...value, ...next });

  const domainItems = (domain: SkillDomain) => value.items.filter((item) => item.domain === domain);
  const replaceDomain = (domain: SkillDomain, list: SetupItem[]) =>
    edit({ items: [...value.items.filter((item) => item.domain !== domain), ...list] });
  const problems = setupProblems(value.items, value.scale);

  return {
    loading: query.isLoading,
    error: save.error ? errorWithDetails(save.error) : null,
    saving: save.isPending,
    problems,
    domainItems,
    addItem: (domain: SkillDomain, name: string) =>
      replaceDomain(domain, [...domainItems(domain), { key: nextKey(), domain, name: name.trim() }]),
    renameItem: (key: string, name: string) =>
      edit({ items: value.items.map((item) => (item.key === key ? { ...item, name } : item)) }),
    removeItem: (key: string) => edit({ items: value.items.filter((item) => item.key !== key) }),
    moveItem: (domain: SkillDomain, from: number, to: number) => {
      const list = [...domainItems(domain)];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      replaceDomain(domain, list);
    },
    scale: value.scale,
    setLevel: (key: string, patch: Partial<SetupLevel>) =>
      edit({ scale: value.scale.map((level) => (level.key === key ? { ...level, ...patch } : level)) }),
    addLevel: () => edit({ scale: [...value.scale, { key: nextKey(), code: "", label: "" }] }),
    removeLevel: (key: string) => edit({ scale: value.scale.filter((level) => level.key !== key) }),
    submit: (event: React.FormEvent) => {
      event.preventDefault();
      if (problems.length > 0) return;
      const count = value.scale.length;
      save.mutate(
        {
          items: value.items.map((item) => ({ id: item.id, domain: item.domain, name: item.name.trim() })),
          scale: value.scale.map((level, index) => ({
            value: count - index,
            code: level.code.trim(),
            label: level.label.trim(),
          })),
        },
        { onSuccess: onDone },
      );
    },
  };
}

export type SkillSetupForm = ReturnType<typeof useSkillSetupForm>;
