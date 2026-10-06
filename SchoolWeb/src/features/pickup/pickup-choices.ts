import type { GuardianLink } from "@/features/guardians/types";
import { humanize } from "@/lib/format";
import { pickerValue } from "./schemas";
import type { PickupPerson } from "./types";

export interface PickupChoice {
  value: string;
  name: string;
  caption: string;
  photoUrl: string | null;
  status: string;
  selectable: boolean;
}

/** Guardians on record first, then authorized persons; only verified ones can be picked. */
export function pickupChoices(guardians: GuardianLink[], persons: PickupPerson[]): PickupChoice[] {
  const fromGuardians = guardians.map((link) => ({
    value: pickerValue("guardian", link.guardian.id),
    name: link.guardian.name,
    caption: [`Guardian · ${humanize(link.relation)}`, link.guardian.phone].filter(Boolean).join(" · "),
    photoUrl: null,
    status: link.status,
    selectable: link.status === "VERIFIED",
  }));
  const fromPersons = persons.map((person) => ({
    value: pickerValue("person", person.id),
    name: person.name,
    caption: [person.relation, person.phone].filter(Boolean).join(" · "),
    photoUrl: person.photoUrl,
    status: person.status,
    selectable: person.status === "VERIFIED",
  }));
  return [...fromGuardians, ...fromPersons];
}
