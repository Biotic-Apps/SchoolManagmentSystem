import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/shared/SectionHeading";

/** Names behind a workload count; renders nothing when the API only sent a number. */
export function WorkloadList({ title, names }: { title: string; names: string[] }) {
  if (names.length === 0) return null;
  return (
    <Card className="flex flex-col gap-3 p-5">
      <SectionHeading title={title} />
      <ul className="flex flex-col gap-1.5 text-label text-fg">
        {names.map((name, index) => (
          <li key={`${name}-${index}`}>{name}</li>
        ))}
      </ul>
    </Card>
  );
}
