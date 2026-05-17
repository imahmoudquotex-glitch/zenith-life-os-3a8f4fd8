import { registerFunction } from './registry';

registerFunction({
  name: 'concat',
  minArgs: 1,
  maxArgs: 999,
  argTypes: ['string'],
  returnType: 'string',
  execute: (...args: string[]) => args.join('')
});

registerFunction({
  name: 'length',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'number',
  execute: (str: string) => str.length
});

registerFunction({
  name: 'upper',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'string',
  execute: (str: string) => str.toUpperCase()
});

registerFunction({
  name: 'lower',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'string',
  execute: (str: string) => str.toLowerCase()
});

registerFunction({
  name: 'substring',
  minArgs: 2,
  maxArgs: 3,
  argTypes: ['string', 'number', 'number'],
  returnType: 'string',
  execute: (str: string, start: number, end?: number) => str.substring(start, end)
});

registerFunction({
  name: 'replace',
  minArgs: 3,
  maxArgs: 3,
  argTypes: ['string', 'string', 'string'],
  returnType: 'string',
  execute: (str: string, search: string, replacement: string) => str.split(search).join(replacement) // split/join prevents regex dos
});

registerFunction({
  name: 'contains',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['string', 'string'],
  returnType: 'boolean',
  execute: (str: string, search: string) => str.includes(search)
});

registerFunction({
  name: 'trim',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'string',
  execute: (str: string) => str.trim()
});
