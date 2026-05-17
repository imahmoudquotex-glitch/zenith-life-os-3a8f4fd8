import { registerFunction } from './registry';

registerFunction({
  name: 'abs',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.abs
});

registerFunction({
  name: 'ceil',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.ceil
});

registerFunction({
  name: 'floor',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.floor
});

registerFunction({
  name: 'round',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.round
});

registerFunction({
  name: 'max',
  minArgs: 1,
  maxArgs: 999,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.max
});

registerFunction({
  name: 'min',
  minArgs: 1,
  maxArgs: 999,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.min
});

registerFunction({
  name: 'pow',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'number',
  execute: Math.pow
});

registerFunction({
  name: 'sqrt',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.sqrt
});

registerFunction({
  name: 'sign',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.sign
});

registerFunction({
  name: 'log',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.log
});

registerFunction({
  name: 'exp',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'number',
  execute: Math.exp
});

registerFunction({
  name: 'mod',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['number', 'number'],
  returnType: 'number',
  execute: (a, b) => a % b
});

registerFunction({
  name: 'pi',
  minArgs: 0,
  maxArgs: 0,
  argTypes: [],
  returnType: 'number',
  execute: () => Math.PI
});
