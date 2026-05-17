import { registerFunction } from './registry';

registerFunction({
  name: 'join',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['array', 'string'],
  returnType: 'string',
  execute: (arr: any[], separator: string) => Array.isArray(arr) ? arr.join(separator) : ''
});

registerFunction({
  name: 'unique',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'array',
  execute: (arr: any[]) => Array.isArray(arr) ? [...new Set(arr)] : []
});

registerFunction({
  name: 'includes',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['array', 'any'],
  returnType: 'boolean',
  execute: (arr: any[], val: any) => Array.isArray(arr) ? arr.includes(val) : false
});

registerFunction({
  name: 'sort',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'array',
  execute: (arr: any[]) => Array.isArray(arr) ? [...arr].sort() : []
});

registerFunction({
  name: 'reverse',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'array',
  execute: (arr: any[]) => Array.isArray(arr) ? [...arr].reverse() : []
});

registerFunction({
  name: 'slice',
  minArgs: 2,
  maxArgs: 3,
  argTypes: ['array', 'number', 'number'],
  returnType: 'array',
  execute: (arr: any[], start: number, end?: number) => Array.isArray(arr) ? arr.slice(start, end) : []
});
