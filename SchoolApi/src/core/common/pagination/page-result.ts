export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export class PageResult<T> {
  constructor(
    readonly data: T[],
    readonly meta: PageMeta,
  ) {}
}
