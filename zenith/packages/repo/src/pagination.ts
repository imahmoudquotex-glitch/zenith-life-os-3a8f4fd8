export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

export function extractCursor(items: any[], limit: number): string | null {
  if (items.length > limit) {
    const nextItem = items.pop();
    return nextItem.id;
  }
  return null;
}
