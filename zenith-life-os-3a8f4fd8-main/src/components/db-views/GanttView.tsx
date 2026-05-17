import React from 'react';

export function GanttView({ rows }: { rows: any[] }) {
  // Gantt placeholder
  return (
    <div className="p-4 w-full h-full text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200">Gantt Chart</h2>
      </div>
      <div className="flex border border-white/10 rounded-xl overflow-hidden bg-gray-900">
        <div className="w-48 bg-gray-800 border-r border-white/10 p-2">
          {rows.map(row => (
            <div key={row.id} className="h-10 flex items-center px-2 text-sm text-gray-300 border-b border-white/5 truncate">
              {row.properties['title'] || 'Untitled'}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto">
          {/* Mock gantt timeline */}
          <div className="h-full min-w-[800px] relative">
            {rows.map((row, i) => (
              <div key={row.id} className="h-10 border-b border-white/5 relative">
                <div 
                  className="absolute top-2 h-6 bg-blue-500/20 border border-blue-500/50 rounded"
                  style={{ left: `${(i % 5) * 10}%`, width: '20%' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
