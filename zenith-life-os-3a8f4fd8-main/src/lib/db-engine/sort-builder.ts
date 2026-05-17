export interface SortCondition {
  propertyId: string;
  direction: 'asc' | 'desc';
}

export function buildSortSql(sorts: SortCondition[] | undefined): string {
  if (!sorts || sorts.length === 0) {
    // Tie breaker
    return 'ORDER BY created_at DESC';
  }

  const orderByParts = sorts.map(sort => {
    // Note: in a real implementation we would sanitize propertyId.
    // Assuming propertyId is safe (e.g. ULID) and JSON querying is supported.
    const propKey = sort.propertyId.replace(/"/g, '""');
    return `(properties->>'${propKey}') ${sort.direction === 'desc' ? 'DESC NULLS LAST' : 'ASC NULLS LAST'}`;
  });

  // Tie breaker at the end to ensure stable sorting
  orderByParts.push('created_at DESC');

  return `ORDER BY ${orderByParts.join(', ')}`;
}
