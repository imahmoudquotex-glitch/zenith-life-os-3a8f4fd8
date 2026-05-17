import React from 'react';

export function ViewSwitcher({ views, activeViewId, onSelectView }: { views: any[], activeViewId: string, onSelectView: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-white/10 px-4 py-2 bg-gray-900 overflow-x-auto">
      {views.map(view => (
        <button
          key={view.id}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            view.id === activeViewId 
              ? 'bg-gray-800 text-white' 
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
          }`}
          onClick={() => onSelectView(view.id)}
        >
          {view.name}
        </button>
      ))}
      <button className="px-2 text-gray-500 hover:text-white transition-colors">
        +
      </button>
    </div>
  );
}
