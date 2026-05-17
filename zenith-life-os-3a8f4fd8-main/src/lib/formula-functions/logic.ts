import { registerFunction } from './registry';

registerFunction({
  name: 'if',
  minArgs: 3,
  maxArgs: 3,
  argTypes: ['boolean', 'any', 'any'],
  returnType: 'any',
  execute: (condition: unknown, trueVal: unknown, falseVal: unknown) => condition ? trueVal : falseVal
});

registerFunction({
  name: 'ifs',
  minArgs: 4,
  maxArgs: 999,
  argTypes: ['any'],
  returnType: 'any',
  execute: (...args: unknown[]) => {
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
  execute: (val: unknown) => {
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

registerFunction({
  name: 'equal',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['any', 'any'],
  returnType: 'boolean',
  execute: (a: unknown, b: unknown) => a === b
});

registerFunction({
  name: 'unequal',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['any', 'any'],
  returnType: 'boolean',
  execute: (a: unknown, b: unknown) => a !== b
});

registerFunction({
  name: 'larger',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'boolean',
  execute: (a: number, b: number) => a > b
});

registerFunction({
  name: 'smaller',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'boolean',
  execute: (a: number, b: number) => a < b
});

registerFunction({
  name: 'largerEq',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'boolean',
  execute: (a: number, b: number) => a >= b
});

registerFunction({
  name: 'smallerEq',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'boolean',
  execute: (a: number, b: number) => a <= b
});
