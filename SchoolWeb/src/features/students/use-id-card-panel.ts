import { useGenerateIdCard, useIdCard } from "./id-card-api";

/** Latest ID card; generating starts a render job and the query polls while it is PENDING. */
export function useIdCardPanel(studentId: string, canGenerate: boolean) {
  const query = useIdCard(studentId);
  const generate = useGenerateIdCard(studentId);
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
