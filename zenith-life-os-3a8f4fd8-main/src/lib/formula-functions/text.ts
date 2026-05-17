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
  execute: (str: string) => (typeof str === 'string' ? str.length : 0)
});

registerFunction({
  name: 'upper',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'string',
  execute: (str: string) => (typeof str === 'string' ? str.toUpperCase() : '')
});

registerFunction({
  name: 'lower',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'string',
  execute: (str: string) => (typeof str === 'string' ? str.toLowerCase() : '')
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
  // split/join prevents regex DoS
  execute: (str: string, search: string, replacement: string) => str.split(search).join(replacement)
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

registerFunction({
  name: 'startsWith',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['string', 'string'],
  returnType: 'boolean',
  execute: (str: string, prefix: string) => str.startsWith(prefix)
});

registerFunction({
  name: 'endsWith',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['string', 'string'],
  returnType: 'boolean',
  execute: (str: string, suffix: string) => str.endsWith(suffix)
});

registerFunction({
  name: 'repeat',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['string', 'number'],
  returnType: 'string',
  execute: (str: string, count: number) => {
    if (count < 0 || count > 1000) return '';
    return str.repeat(count);
  }
});

registerFunction({
  name: 'padStart',
  minArgs: 2,
  maxArgs: 3,
  argTypes: ['string', 'number', 'string'],
  returnType: 'string',
  execute: (str: string, len: number, fill?: string) => str.padStart(len, fill || ' ')
});

registerFunction({
  name: 'padEnd',
  minArgs: 2,
  maxArgs: 3,
  argTypes: ['string', 'number', 'string'],
  returnType: 'string',
  execute: (str: string, len: number, fill?: string) => str.padEnd(len, fill || ' ')
});

registerFunction({
  name: 'split',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['string', 'string'],
  returnType: 'array',
  execute: (str: string, delimiter: string) => str.split(delimiter)
});

registerFunction({
  name: 'format',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['number'],
  returnType: 'string',
  execute: (num: number) => String(num)
});

registerFunction({
  name: 'toNumber',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'number',
  execute: (str: string) => {
    const n = Number(str);
    return isNaN(n) ? 0 : n;
  }
});
