import { useGenerateStaffIdCard, useStaffIdCard } from "./id-card-api";

export function useStaffIdCardPanel(staffId: string, canGenerate: boolean) {
  const query = useStaffIdCard(staffId);
  const generate = useGenerateStaffIdCard(staffId);
  const card = query.data ?? null;
  const pending = card?.status === "PENDING" || generate.isPending;

  return {
    query,
    card,
    pending,
    ready: card?.status === "READY" && !!card.fileUrl,
    failed: card?.status === "FAILED",
    canGenerate: canGenerate && !pending,
    generateLabel: card ? "Reprint ID card" : "Generate ID card",
    generate: () => generate.mutate(),
  };
}
