import { registerFunction } from './registry';

registerFunction({
  name: 'abs',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.abs(n)
});

registerFunction({
  name: 'ceil',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.ceil(n)
});

registerFunction({
  name: 'floor',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.floor(n)
});

registerFunction({
  name: 'round',
  minArgs: 1,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'number',
  execute: (n: number, decimals?: number) => {
    if (decimals === undefined) return Math.round(n);
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
  }
});

registerFunction({
  name: 'max',
  minArgs: 1,
  maxArgs: 999,
  argTypes: ['number'],
  returnType: 'number',
  execute: (...args: number[]) => Math.max(...args)
});

registerFunction({
  name: 'min',
  minArgs: 1,
  maxArgs: 999,
  argTypes: ['number'],
  returnType: 'number',
  execute: (...args: number[]) => Math.min(...args)
});

registerFunction({
  name: 'pow',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'number',
  execute: (base: number, exp: number) => Math.pow(base, exp)
});

registerFunction({
  name: 'sqrt',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.sqrt(n)
});

registerFunction({
  name: 'sign',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.sign(n)
});

registerFunction({
  name: 'log',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.log(n)
});

registerFunction({
  name: 'log10',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.log10(n)
});

registerFunction({
  name: 'log2',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.log2(n)
});

registerFunction({
  name: 'exp',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.exp(n)
});

registerFunction({
  name: 'mod',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'number',
  execute: (a: number, b: number) => {
    if (b === 0) return 0;
    return a % b;
  }
});

registerFunction({
  name: 'pi',
  minArgs: 0,
  maxArgs: 0,
  argTypes: [],
  returnType: 'number',
  execute: () => Math.PI
});

registerFunction({
  name: 'e',
  minArgs: 0,
  maxArgs: 0,
  argTypes: [],
  returnType: 'number',
  execute: () => Math.E
});

registerFunction({
  name: 'clamp',
  minArgs: 3,
  maxArgs: 3,
  argTypes: ['number', 'number', 'number'],
  returnType: 'number',
  execute: (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)
});

registerFunction({
  name: 'trunc',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.trunc(n)
});

registerFunction({
  name: 'cbrt',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: (n: number) => Math.cbrt(n)
});
