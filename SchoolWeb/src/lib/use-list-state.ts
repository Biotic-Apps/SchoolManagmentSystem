import { useCallback, useMemo, useState } from "react";
import { useDebouncedValue } from "./use-debounced-value";

export type ListFilters = Record<string, string | undefined>;

export const DEFAULT_PAGE_SIZE = 20;

/** Page, debounced search and filters for a server-paginated list. */
export function useListState<F extends ListFilters>(initialFilters: F, pageSize = DEFAULT_PAGE_SIZE) {
  const [initial] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState("");
  const [filters, setFilters] = useState<F>(initial);
  const debouncedSearch = useDebouncedValue(search.trim());

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setSearchValue("");
    setFilters(initial);
    setPage(1);
  }, [initial]);

  const params = useMemo(
    () => ({ page, pageSize, search: debouncedSearch || undefined, ...filters }),
    [page, pageSize, debouncedSearch, filters],
  );

  return { page, setPage, search, setSearch, filters, setFilter, reset, params };
}

export type ListState<F extends ListFilters> = ReturnType<typeof useListState<F>>;
