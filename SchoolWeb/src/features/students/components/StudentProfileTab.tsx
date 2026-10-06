import { DetailList } from "@/components/shared/DetailList";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { medicalItems, profileItems } from "../profile-items";
import type { StudentDetail } from "../types";

export function StudentProfileTab({ student }: { student: StudentDetail }) {
  const medical = medicalItems(student);
  return (
    <div className="flex flex-col gap-6">
      <DetailList items={profileItems(student)} />
      {medical && (
        <section className="flex flex-col gap-3">
          <SectionHeading title="Medical" />
          <DetailList items={medical} />
        </section>
      )}
    </div>
  );
}
