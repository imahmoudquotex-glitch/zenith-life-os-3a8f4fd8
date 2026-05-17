import React, { useState } from 'react';
import { functionRegistry } from '../../lib/formula-functions/registry';

interface FunctionPickerProps {
  onSelect: (funcName: string) => void;
}

export const FunctionPicker: React.FC<FunctionPickerProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  
  const functions = Object.values(functionRegistry).filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-4 w-64 text-white">
      <input 
        type="text" 
        placeholder="Search functions..." 
        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 mb-4 text-sm"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="max-h-64 overflow-y-auto space-y-1">
        {functions.map(f => (
          <button 
            key={f.name}
            className="w-full text-left px-2 py-1 hover:bg-zinc-800 rounded text-sm text-green-400 font-mono"
            onClick={() => onSelect(f.name)}
          >
            {f.name}()
          </button>
        ))}
      </div>
    </div>
  );
};
