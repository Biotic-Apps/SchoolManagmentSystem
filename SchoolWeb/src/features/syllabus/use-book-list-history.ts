import { useState } from "react";
import { useBookListRevisions } from "./api";

export function useBookListHistory(bookListId: string | null) {
  const query = useBookListRevisions(bookListId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const revisions = [...(query.data ?? [])].sort((a, b) => b.revision - a.revision);

  return {
    query,
    revisions,
    isExpanded: (id: string) => expandedId === id,
    toggle: (id: string) => setExpandedId((current) => (current === id ? null : id)),
  };
}
