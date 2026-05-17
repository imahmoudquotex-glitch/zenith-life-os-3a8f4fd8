import React from 'react';

export function CalendarView({ rows }: { rows: any[] }) {
  // Calendar placeholder. Real implementation uses react-big-calendar or similar
  return (
    <div className="p-4 w-full h-full text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200">Calendar</h2>
        <div className="flex gap-2">
          <button className="bg-gray-800 px-3 py-1 rounded">Prev</button>
          <button className="bg-gray-800 px-3 py-1 rounded">Today</button>
          <button className="bg-gray-800 px-3 py-1 rounded">Next</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 bg-gray-800 p-px rounded-xl border border-white/10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-gray-900 p-2 text-center text-sm font-medium text-gray-400">{d}</div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-gray-900 h-24 p-1 hover:bg-gray-800/50 transition-colors">
            <span className="text-xs text-gray-500">{i % 30 + 1}</span>
            {/* Events placeholder */}
          </div>
        ))}
      </div>
    </div>
  );
}
