import { notFound } from "next/navigation";
import { BUILT_MODULES } from "@/config/module-phases";
import { NAV_CATALOGUE, findNavByRoute } from "@/config/navigation";
import { ModuleComingSoon } from "@/features/modules/components/ModuleComingSoon";

export const dynamicParams = false;

// Built modules have their own route folders; everything else shows its planned phase.
export function generateStaticParams() {
  return NAV_CATALOGUE.filter((entry) => !BUILT_MODULES.has(entry.id)).map((entry) => ({
    module: entry.route.slice(1),
  }));
}

export async function generateMetadata({ params }: PageProps<"/[module]">) {
  const { module: segment } = await params;
  return { title: findNavByRoute(segment)?.label };
}

export default async function ModulePage({ params }: PageProps<"/[module]">) {
  const { module: segment } = await params;
  const entry = findNavByRoute(segment);
  if (!entry || BUILT_MODULES.has(entry.id)) notFound();
  return <ModuleComingSoon moduleId={entry.id} />;
}
