import React from 'react';

export function ListView({ rows, properties }: { rows: any[], properties: any[] }) {
  // Simplified table
  return (
    <div className="w-full">
      {rows.map(row => (
        <div key={row.id} className="flex items-center gap-4 p-2 border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
          <div className="flex-1 font-medium text-gray-200">
            {row.properties['title'] || 'Untitled'}
          </div>
          <div className="flex gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
            {properties.filter(p => p.name !== 'title' && !p.isHidden).slice(0, 3).map(prop => (
              <div key={prop.id} className="text-sm text-gray-400">
                {JSON.stringify(row.properties[prop.name])}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
