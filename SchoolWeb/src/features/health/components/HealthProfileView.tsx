import type { ReactNode } from "react";
import { DetailList } from "@/components/shared/DetailList";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EMPTY_VALUE, textOrDash } from "@/lib/format";
import type { HealthProfile } from "../types";
import { AllergyList } from "./AllergyList";

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function None({ text }: { text: string }) {
  return <p className="text-label text-fg-muted">{text}</p>;
}

export function HealthProfileView({ profile }: { profile: HealthProfile }) {
  const contacts = [...profile.emergencyContacts].sort((a, b) => a.priority - b.priority);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <InfoCard title="Medical summary">
        <DetailList
          items={[
            { label: "Blood group", value: textOrDash(profile.bloodGroup) },
            { label: "Doctor", value: profile.doctor ? `${profile.doctor.name} · ${profile.doctor.phone}` : EMPTY_VALUE },
            {
              label: "Conditions",
              value: profile.conditions.length ? profile.conditions.join(", ") : "None recorded",
            },
          ]}
        />
      </InfoCard>
      <InfoCard title="Allergies">
        {profile.allergies.length ? <AllergyList allergies={profile.allergies} /> : <None text="No known allergies." />}
      </InfoCard>
      <InfoCard title="Medications">
        {profile.medications.length ? (
          <ul className="flex flex-col gap-2">
            {profile.medications.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex flex-col gap-0.5">
                <span className="text-label font-medium text-fg">{item.name}</span>
                <span className="text-caption text-fg-muted">
                  {[item.dose, item.schedule].filter(Boolean).join(" · ") || EMPTY_VALUE}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <None text="No regular medication." />
        )}
      </InfoCard>
      <InfoCard title="Instructions for staff">
        {profile.instructions ? (
          <p className="whitespace-pre-line break-words text-label text-fg">{profile.instructions}</p>
        ) : (
          <None text="No special instructions." />
        )}
      </InfoCard>
      <div className="lg:col-span-2">
        <InfoCard title="Emergency contacts">
          {contacts.length ? (
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {contacts.map((contact, index) => (
                <li key={`${contact.phone}-${index}`} className="flex items-start gap-3 rounded-input border border-border p-3">
                  <Badge tone="primary">{index + 1}</Badge>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-label font-medium text-fg">{contact.name}</span>
                    <span className="truncate text-caption text-fg-muted">
                      {contact.relation} · {contact.phone}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <None text="No emergency contacts recorded." />
          )}
        </InfoCard>
      </div>
    </div>
  );
}
