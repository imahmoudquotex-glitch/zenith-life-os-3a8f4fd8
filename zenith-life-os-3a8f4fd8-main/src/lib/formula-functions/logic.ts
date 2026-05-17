import { registerFunction } from './registry';

registerFunction({
  name: 'if',
  minArgs: 3,
  maxArgs: 3,
  argTypes: ['boolean', 'any', 'any'],
  returnType: 'any',
  execute: (condition: boolean, trueVal: any, falseVal: any) => condition ? trueVal : falseVal
});

registerFunction({
  name: 'ifs',
  minArgs: 4,
  maxArgs: 999, // condition, val, condition, val...
  argTypes: ['any'],
  returnType: 'any',
  execute: (...args: any[]) => {
    for (let i = 0; i < args.length; i += 2) {
      if (args[i]) return args[i + 1];
    }
    return null;
  }
});

registerFunction({
  name: 'empty',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['any'],
  returnType: 'boolean',
  execute: (val: any) => {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string' && val.trim() === '') return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  }
});

registerFunction({
  name: 'not',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['boolean'],
  returnType: 'boolean',
  execute: (val: boolean) => !val
});

registerFunction({
  name: 'and',
  minArgs: 1,
  maxArgs: 999,
  argTypes: ['boolean'],
  returnType: 'boolean',
  execute: (...args: boolean[]) => args.every(a => !!a)
});

registerFunction({
  name: 'or',
  minArgs: 1,
  maxArgs: 999,
  argTypes: ['boolean'],
  returnType: 'boolean',
  execute: (...args: boolean[]) => args.some(a => !!a)
});
