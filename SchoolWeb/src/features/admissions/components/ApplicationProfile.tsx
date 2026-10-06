import { DetailList } from "@/components/shared/DetailList";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GENDER_OPTIONS, optionName } from "@/features/people/options";
import { formatDate, textOrDash } from "@/lib/format";
import type { Application } from "../types";

/** Class, child and note details of an application. */
export function ApplicationProfile({ app }: { app: Application }) {
  const { child, medical } = app;
  const items = [
    { label: "Class", value: textOrDash(app.className) },
    { label: "Applied on", value: formatDate(app.createdAt) },
    { label: "Date of birth", value: formatDate(child?.dob) },
    { label: "Gender", value: textOrDash(optionName(GENDER_OPTIONS, child?.gender)) },
    { label: "B-Form number", value: textOrDash(child?.bForm) },
    { label: "Previous school", value: textOrDash(child?.previousSchool) },
    { label: "Notes", value: textOrDash(app.notes) },
    ...(app.decisionReason ? [{ label: "Decision reason", value: app.decisionReason }] : []),
  ];

  return (
    <>
      <section className="flex flex-col gap-3">
        <SectionHeading title="Child" />
        <DetailList items={items} />
      </section>
      <section className="flex flex-col gap-3">
        <SectionHeading title="Medical" />
        <DetailList
          items={[
            { label: "Allergies", value: textOrDash(medical?.allergies) },
            { label: "Medical conditions", value: textOrDash(medical?.conditions) },
            { label: "Notes for staff", value: textOrDash(medical?.notes) },
          ]}
        />
      </section>
    </>
  );
}
