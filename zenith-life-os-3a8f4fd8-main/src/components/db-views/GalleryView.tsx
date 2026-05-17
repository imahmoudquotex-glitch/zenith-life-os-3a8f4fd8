import React from 'react';

export function GalleryView({ rows, properties }: { rows: any[], properties: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {rows.map(row => (
        <div key={row.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-white/5">
          {/* Card cover placeholder */}
          <div className="h-32 bg-gray-700 w-full" />
          <div className="p-4">
            {properties.filter(p => !p.isHidden).map(prop => (
              <div key={prop.id} className="mb-2 text-sm text-gray-300">
                <span className="text-gray-500 mr-2">{prop.name}:</span>
                {JSON.stringify(row.properties[prop.name])}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
