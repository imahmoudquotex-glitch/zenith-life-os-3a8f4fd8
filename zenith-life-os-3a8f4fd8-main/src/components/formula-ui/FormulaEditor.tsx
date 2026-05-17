import React, { useState } from 'react';
import { FormulaPreview } from './FormulaPreview';
import { FunctionPicker } from './FunctionPicker';

interface FormulaEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  context: { properties: Record<string, any>; vaultProperties?: Set<string> };
  propertyTypes: Record<string, any>;
}

export const FormulaEditor: React.FC<FormulaEditorProps> = ({ initialValue = '', onChange, context, propertyTypes }) => {
  const [expression, setExpression] = useState(initialValue);

  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setExpression(val);
    onChange(val);
  };

  const insertFunction = (funcName: string) => {
    const newVal = expression + `${funcName}()`;
    setExpression(newVal);
    onChange(newVal);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex-1 flex flex-col gap-4">
        <textarea
          value={expression}
          onChange={handleExpressionChange}
          className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md p-4 text-green-400 font-mono text-sm focus:outline-none focus:border-green-500 transition-colors resize-none"
          placeholder="Type formula here..."
          dir="ltr"
        />
        <FormulaPreview expression={expression} context={context} propertyTypes={propertyTypes} />
      </div>
      <div>
        <FunctionPicker onSelect={insertFunction} />
      </div>
    </div>
  );
};
