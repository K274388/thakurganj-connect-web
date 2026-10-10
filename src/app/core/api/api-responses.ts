/** Envelope returned by every paginated directory endpoint. */
export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Envelope returned by catalog endpoints that are not paginated. */
export interface ItemsResponse<T> {
  items: T[];
}
