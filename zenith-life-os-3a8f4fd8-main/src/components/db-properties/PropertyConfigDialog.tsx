import React from 'react';

export function PropertyConfigDialog({ property, onClose, onSave }: { property: any, onClose: () => void, onSave: (config: any) => void }) {
  // Configures the property (name, type, config like select options)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 w-96">
        <h3 className="text-lg font-bold text-white mb-4">Configure Property</h3>
        {/* Placeholder config dialog */}
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => onSave({ ...property.config })}>
          Save
        </button>
      </div>
    </div>
  );
}
