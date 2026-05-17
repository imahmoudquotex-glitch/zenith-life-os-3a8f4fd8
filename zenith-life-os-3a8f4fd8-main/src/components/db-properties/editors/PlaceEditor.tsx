import React from 'react';

export function PlaceEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
  return (
    <input
      type="text"
      className="w-full bg-transparent p-1 focus:outline-none text-sm"
      placeholder="Search place..."
      value={value?.formattedAddress || ''}
      onChange={(e) => onChange({ formattedAddress: e.target.value })}
    />
  );
}
