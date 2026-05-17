import React from 'react';

export function FileEditor({ value, onChange }: { value: any; onChange: (val: any) => void }) {
  return (
    <div className="flex items-center gap-2 p-1">
      <input type="file" multiple className="text-sm bg-transparent w-full focus:outline-none" onChange={(e) => {
        // Mock file upload handling
        const files = Array.from(e.target.files || []).map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
        onChange(files);
      }} />
    </div>
  );
}
