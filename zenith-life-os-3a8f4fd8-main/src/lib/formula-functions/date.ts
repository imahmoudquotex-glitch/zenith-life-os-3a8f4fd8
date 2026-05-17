import { registerFunction } from './registry';

// Note: Date manipulation uses primitive built-ins to maintain lightweight footprint.
// In a full implementation, consider passing context timezone to functions.

registerFunction({
  name: 'now',
  minArgs: 0,
  maxArgs: 0,
  argTypes: [],
  returnType: 'date',
  execute: () => new Date().toISOString()
});

registerFunction({
  name: 'dateAdd',
  minArgs: 3,
  maxArgs: 3,
  argTypes: ['date', 'number', 'string'],
  returnType: 'date',
  execute: (dateStr: string, amount: number, unit: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    switch (unit) {
      case 'years': d.setFullYear(d.getFullYear() + amount); break;
      case 'months': d.setMonth(d.getMonth() + amount); break;
      case 'days': d.setDate(d.getDate() + amount); break;
      case 'hours': d.setHours(d.getHours() + amount); break;
      case 'minutes': d.setMinutes(d.getMinutes() + amount); break;
      case 'seconds': d.setSeconds(d.getSeconds() + amount); break;
    }
    return d.toISOString();
  }
});

registerFunction({
  name: 'dateSubtract',
  minArgs: 3,
  maxArgs: 3,
  argTypes: ['date', 'number', 'string'],
  returnType: 'date',
  execute: (dateStr: string, amount: number, unit: string) => {
    return functionRegistry['dateAdd'].execute(dateStr, -amount, unit);
  }
});

registerFunction({
  name: 'dateBetween',
  minArgs: 3,
  maxArgs: 3,
  argTypes: ['date', 'date', 'string'],
  returnType: 'number',
  execute: (d1Str: string, d2Str: string, unit: string) => {
    const d1 = new Date(d1Str).getTime();
    const d2 = new Date(d2Str).getTime();
    if (isNaN(d1) || isNaN(d2)) return null;
    const diff = d1 - d2;
    switch (unit) {
      case 'years': return diff / (1000 * 60 * 60 * 24 * 365.25);
      case 'months': return diff / (1000 * 60 * 60 * 24 * 30.44);
      case 'days': return diff / (1000 * 60 * 60 * 24);
      case 'hours': return diff / (1000 * 60 * 60);
      case 'minutes': return diff / (1000 * 60);
      case 'seconds': return diff / 1000;
      default: return diff;
    }
  }
});

registerFunction({
  name: 'formatDate',
  minArgs: 2,
  maxArgs: 2,
  argTypes: ['date', 'string'],
  returnType: 'string',
  execute: (dateStr: string, format: string) => {
    // A primitive implementation. Full ICU formatting normally required.
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0]; // stub
  }
});

registerFunction({
  name: 'year',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['date'],
  returnType: 'number',
  execute: (dateStr: string) => new Date(dateStr).getFullYear()
});

registerFunction({
  name: 'month',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['date'],
  returnType: 'number',
  execute: (dateStr: string) => new Date(dateStr).getMonth()
});

registerFunction({
  name: 'day',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['date'],
  returnType: 'number',
  execute: (dateStr: string) => new Date(dateStr).getDate()
});

import { functionRegistry } from './registry';
