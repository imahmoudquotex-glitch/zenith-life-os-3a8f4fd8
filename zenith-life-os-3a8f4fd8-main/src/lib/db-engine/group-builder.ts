export interface GroupCondition {
  propertyId: string;
  type: string; // 'select', 'status', 'person', 'date_week', 'date_month'
}

export function buildGroupSql(groupBy: GroupCondition | undefined): string {
  if (!groupBy) {
    return '';
  }

  const propKey = groupBy.propertyId.replace(/"/g, '""');

  if (groupBy.type === 'date_month') {
    return `DATE_TRUNC('month', (properties->>'${propKey}')::timestamp)`;
  } else if (groupBy.type === 'date_week') {
    return `DATE_TRUNC('week', (properties->>'${propKey}')::timestamp)`;
  }

  // default grouping for select, status, person
  return `properties->>'${propKey}'`;
}
