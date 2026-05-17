import React, { useState } from 'react';
import { Parser } from '../../lib/formula-engine/parser';
import { TypeChecker } from '../../lib/formula-engine/type-checker';
import { Evaluator } from '../../lib/formula-engine/evaluator';
import { SafeFormulaError } from '../../lib/formula-engine/safe-error';

interface FormulaPreviewProps {
  expression: string;
  context: { properties: Record<string, any>; vaultProperties?: Set<string> };
  propertyTypes: Record<string, any>;
}

export const FormulaPreview: React.FC<FormulaPreviewProps> = ({ expression, context, propertyTypes }) => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      if (!expression.trim()) {
        setResult(null);
        setError(null);
        return;
      }
      const parser = new Parser(expression);
      const ast = parser.parse();
      
      const typeChecker = new TypeChecker(propertyTypes);
      typeChecker.check(ast);

      const evaluator = new Evaluator(ast, 50);
      const res = evaluator.evaluate(context);
      setResult(res);
      setError(null);
    } catch (e: any) {
      if (e instanceof SafeFormulaError) {
        setError(`[${e.code}] ${e.message}`);
      } else {
        setError(e.message);
      }
      setResult(null);
    }
  }, [expression, context, propertyTypes]);

  return (
    <div className="p-4 border border-zinc-800 rounded-md bg-zinc-950 text-white font-mono text-sm" dir="ltr">
      <h3 className="text-zinc-400 mb-2">Preview</h3>
      {error ? (
        <div className="text-red-500" role="alert" aria-live="assertive">
          {error}
        </div>
      ) : (
        <div className="text-green-400">
          {JSON.stringify(result)}
        </div>
      )}
    </div>
  );
};
