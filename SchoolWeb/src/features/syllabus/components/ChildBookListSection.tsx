import type { UseQueryResult } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { BookList } from "../types";
import { BookItemsTable } from "./BookItemsTable";

interface ChildBookListSectionProps {
  query: UseQueryResult<BookList[]>;
  bookList: BookList | null;
}

export function ChildBookListSection({ query, bookList }: ChildBookListSectionProps) {
  const empty = !query.isLoading && !query.error && !bookList;
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Book list" />
      {bookList?.approvedAt && (
        <p className="text-caption text-fg-muted">
          Revision {bookList.revision} · Approved {formatDate(bookList.approvedAt)}
        </p>
      )}
      {query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {empty && (
        <Card>
          <EmptyState icon={BookOpen} title="No approved book list yet" />
        </Card>
      )}
      {(query.isLoading || bookList) && <BookItemsTable items={bookList?.items} loading={query.isLoading} />}
    </section>
  );
}
