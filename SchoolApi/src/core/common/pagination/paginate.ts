import { PageResult } from './page-result';
import type { PaginationQueryDto } from './pagination-query.dto';

export interface SkipTake {
  skip: number;
  take: number;
}

export function toSkipTake(query: PaginationQueryDto): SkipTake {
  return { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
}

export function toPageResult<T>(
  items: T[],
  total: number,
  query: PaginationQueryDto,
): PageResult<T> {
  return new PageResult(items, {
    page: query.page,
    pageSize: query.pageSize,
    total,
  });
}
