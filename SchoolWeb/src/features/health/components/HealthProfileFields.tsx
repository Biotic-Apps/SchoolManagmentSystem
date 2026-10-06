"use client";

import { FormSection } from "@/components/shared/FormSection";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { ALLERGY_SEVERITY_OPTIONS, BLOOD_GROUP_OPTIONS } from "../options";
import { EMPTY_ALLERGY, EMPTY_CONDITION, EMPTY_CONTACT, EMPTY_MEDICATION } from "../profile-schemas";
import { ArrayFields } from "./ArrayFields";

const GRID = "grid grid-cols-1 gap-3 md:grid-cols-3";

/** Full health-profile editor (used for staff edits and parent change requests). */
export function HealthProfileFields() {
  return (
    <div className="flex flex-col gap-4">
      <FormSection title="General">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SelectField name="bloodGroup" label="Blood group" options={BLOOD_GROUP_OPTIONS} emptyLabel="Not known" placeholder="Not known" />
          <TextField name="doctorName" label="Doctor" />
          <TextField name="doctorPhone" label="Doctor's phone" type="tel" />
        </div>
      </FormSection>
      <FormSection title="Allergies">
        <ArrayFields
          name="allergies"
          itemLabel="Allergy"
          addLabel="Add allergy"
          emptyItem={EMPTY_ALLERGY}
          emptyText="No known allergies."
          renderRow={(prefix) => (
            <div className={GRID}>
              <TextField name={`${prefix}.name`} label="Allergic to" required />
              <SelectField name={`${prefix}.severity`} label="Severity" options={ALLERGY_SEVERITY_OPTIONS} required />
              <TextField name={`${prefix}.reaction`} label="Reaction" placeholder="e.g. Rash, swelling" />
            </div>
          )}
        />
      </FormSection>
      <FormSection title="Conditions">
        <ArrayFields
          name="conditions"
          itemLabel="Condition"
          addLabel="Add condition"
          emptyItem={EMPTY_CONDITION}
          emptyText="No ongoing conditions."
          renderRow={(prefix) => <TextField name={`${prefix}.value`} label="Condition" required placeholder="e.g. Asthma" />}
        />
      </FormSection>
      <FormSection title="Medications">
        <ArrayFields
          name="medications"
          itemLabel="Medicine"
          addLabel="Add medicine"
          emptyItem={EMPTY_MEDICATION}
          emptyText="No regular medication."
          renderRow={(prefix) => (
            <div className={GRID}>
              <TextField name={`${prefix}.name`} label="Medicine" required />
              <TextField name={`${prefix}.dose`} label="Dose" placeholder="e.g. 5 ml" />
              <TextField name={`${prefix}.schedule`} label="Schedule" placeholder="e.g. After lunch" />
            </div>
          )}
        />
      </FormSection>
      <FormSection title="Instructions for staff">
        <TextareaField name="instructions" label="Instructions" placeholder="What staff should do, e.g. inhaler in the school bag" />
      </FormSection>
      <FormSection title="Emergency contacts" description="Listed in the order to call them.">
        <ArrayFields
          name="emergencyContacts"
          itemLabel="Contact"
          addLabel="Add contact"
          emptyItem={EMPTY_CONTACT}
          emptyText="No emergency contacts."
          renderRow={(prefix) => (
            <div className={GRID}>
              <TextField name={`${prefix}.name`} label="Name" required />
              <TextField name={`${prefix}.relation`} label="Relation" required placeholder="e.g. Uncle" />
              <TextField name={`${prefix}.phone`} label="Phone" type="tel" required />
            </div>
          )}
        />
      </FormSection>
    </div>
  );
}
