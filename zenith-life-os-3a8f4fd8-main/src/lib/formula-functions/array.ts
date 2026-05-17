import { registerFunction } from './registry';

registerFunction({
  name: 'join',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['array', 'string'],
  returnType: 'string',
  execute: (arr: unknown[], separator: string) => Array.isArray(arr) ? arr.join(separator) : ''
});

registerFunction({
  name: 'unique',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'array',
  execute: (arr: unknown[]) => Array.isArray(arr) ? [...new Set(arr)] : []
});

registerFunction({
  name: 'includes',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['array', 'any'],
  returnType: 'boolean',
  execute: (arr: unknown[], val: unknown) => Array.isArray(arr) ? arr.includes(val) : false
});

registerFunction({
  name: 'sort',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'array',
  execute: (arr: unknown[]) => Array.isArray(arr) ? [...arr].sort() : []
});

registerFunction({
  name: 'reverse',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'array',
  execute: (arr: unknown[]) => Array.isArray(arr) ? [...arr].reverse() : []
});

registerFunction({
  name: 'slice',
  minArgs: 2,
  maxArgs: 3,
  argTypes: ['array', 'number', 'number'],
  returnType: 'array',
  execute: (arr: unknown[], start: number, end?: number) => Array.isArray(arr) ? arr.slice(start, end) : []
});

registerFunction({
  name: 'flat',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'array',
  execute: (arr: unknown[]) => Array.isArray(arr) ? arr.flat(1) : []
});

registerFunction({
  name: 'first',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'any',
  execute: (arr: unknown[]) => Array.isArray(arr) && arr.length > 0 ? arr[0] : null
});

registerFunction({
  name: 'last',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'any',
  execute: (arr: unknown[]) => Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : null
});

registerFunction({
  name: 'at',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['array', 'number'],
  returnType: 'any',
  execute: (arr: unknown[], index: number) => {
    if (!Array.isArray(arr)) return null;
    if (index < 0 || index >= arr.length) return null;
    return arr[index];
  }
});
