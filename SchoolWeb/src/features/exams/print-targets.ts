import type { Option } from "@/components/shared/OptionSelect";
import type { ExamPrintInput } from "./print-api";

export interface PrintSectionLike {
  id: string;
  name: string;
  classId: string;
  className: string;
}

/** "all", "class:<id>" or "section:<id>" → request fields. */
export function targetInput(target: string): Pick<ExamPrintInput, "classId" | "sectionId"> {
  if (target.startsWith("class:")) return { classId: target.slice(6) };
  if (target.startsWith("section:")) return { sectionId: target.slice(8) };
  return {};
}

/** Whole exam, each class (all its sections), then each section. */
export function targetOptions(classes: Option[], sections: PrintSectionLike[], withSections = true): Option[] {
  const options: Option[] = [{ id: "all", name: "All classes" }];
  for (const item of classes) {
    options.push({ id: `class:${item.id}`, name: withSections ? `${item.name} · all sections` : item.name });
    if (!withSections) continue;
    for (const section of sections.filter((s) => s.classId === item.id)) {
      options.push({ id: `section:${section.id}`, name: `${section.className} ${section.name}` });
    }
  }
  return options;
}
