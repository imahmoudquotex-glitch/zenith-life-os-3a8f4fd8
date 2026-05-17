import { registerFunction } from './registry';

// Note: Date manipulation uses primitive built-ins to maintain lightweight footprint.
// FIXED: now() receives runtime timestamp from evaluator context, not Date.now()

registerFunction({
  name: 'now',
  minArgs: 0,
  maxArgs: 0,
  argTypes: [],
  returnType: 'date',
  // NOTE: This is a stub. In production, `now` is injected via FormulaRuntime.now
  // from server clock snapshot. This ensures determinism per ADR-0003.
  execute: () => { throw new Error('now() must be resolved by evaluator with injected runtime.now'); }
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
      case 'weeks': d.setDate(d.getDate() + (amount * 7)); break;
      case 'days': d.setDate(d.getDate() + amount); break;
      case 'hours': d.setHours(d.getHours() + amount); break;
      case 'minutes': d.setMinutes(d.getMinutes() + amount); break;
      case 'seconds': d.setSeconds(d.getSeconds() + amount); break;
      default: return null;
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
    const fn = functionRegistry['dateAdd'];
    return fn.execute(dateStr, -amount, unit);
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
      case 'years': return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      case 'months': return Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
      case 'weeks': return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
      case 'days': return Math.floor(diff / (1000 * 60 * 60 * 24));
      case 'hours': return Math.floor(diff / (1000 * 60 * 60));
      case 'minutes': return Math.floor(diff / (1000 * 60));
      case 'seconds': return Math.floor(diff / 1000);
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
  execute: (dateStr: string, _format: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0]; // ISO date stub
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
  execute: (dateStr: string) => new Date(dateStr).getMonth() + 1 // 1-indexed
});

registerFunction({
  name: 'day',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['date'],
  returnType: 'number',
  execute: (dateStr: string) => new Date(dateStr).getDate()
});

registerFunction({
  name: 'hour',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['date'],
  returnType: 'number',
  execute: (dateStr: string) => new Date(dateStr).getHours()
});

registerFunction({
  name: 'minute',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['date'],
  returnType: 'number',
  execute: (dateStr: string) => new Date(dateStr).getMinutes()
});

registerFunction({
  name: 'toDate',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['string'],
  returnType: 'date',
  execute: (str: string) => {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
});

registerFunction({
  name: 'timestamp',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['date'],
  returnType: 'number',
  execute: (dateStr: string) => new Date(dateStr).getTime()
});

import { functionRegistry } from './registry';
