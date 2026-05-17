import React from 'react';

export function RollupEditor({ value }: { value: any }) {
  // Rollups are computed server-side, this editor is read-only.
  return (
    <div className="flex items-center gap-2 p-1 text-gray-400 bg-gray-800/50 rounded pointer-events-none">
      <span className="text-sm truncate">
        {value?.value != null ? String(value.value) : '—'}
      </span>
    </div>
  );
}
