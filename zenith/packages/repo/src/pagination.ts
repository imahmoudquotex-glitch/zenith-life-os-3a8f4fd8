export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

export function extractCursor(items: { id: string; [key: string]: unknown }[], limit: number): string | null {
  if (items.length > limit) {
    const nextItem = items.pop();
    return nextItem ? nextItem.id : null;
  }
  return null;
}
