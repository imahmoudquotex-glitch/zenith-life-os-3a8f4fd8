import { registerFunction } from './registry';

// Rollups are specialized array reducers passed from relations

registerFunction({
  name: 'countAll',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => Array.isArray(arr) ? arr.length : 0
});

registerFunction({
  name: 'countValues',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => Array.isArray(arr) ? arr.filter(x => x !== null && x !== undefined && x !== '').length : 0
});

registerFunction({
  name: 'countUniqueValues',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => Array.isArray(arr) ? new Set(arr.filter(x => x !== null && x !== undefined && x !== '')).size : 0
});

registerFunction({
  name: 'countEmpty',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => Array.isArray(arr) ? arr.filter(x => x === null || x === undefined || x === '').length : 0
});

registerFunction({
  name: 'percentEmpty',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const empty = arr.filter(x => x === null || x === undefined || x === '').length;
    return empty / arr.length;
  }
});

registerFunction({
  name: 'percentNotEmpty',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const notEmpty = arr.filter(x => x !== null && x !== undefined && x !== '').length;
    return notEmpty / arr.length;
  }
});

registerFunction({
  name: 'sum',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((acc: number, val) => acc + (typeof val === 'number' ? val : 0), 0);
  }
});

registerFunction({
  name: 'average',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const nums = arr.filter((x): x is number => typeof x === 'number');
    if (nums.length === 0) return 0;
    return nums.reduce((acc, val) => acc + val, 0) / nums.length;
  }
});

registerFunction({
  name: 'median',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => {
    if (!Array.isArray(arr)) return 0;
    const nums = arr.filter((x): x is number => typeof x === 'number').sort((a, b) => a - b);
    if (nums.length === 0) return 0;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  }
});

registerFunction({
  name: 'range',
  minArgs: 1,
  maxArgs: 1,
  argTypes: ['array'],
  returnType: 'number',
  execute: (arr: unknown[]) => {
    if (!Array.isArray(arr)) return 0;
    const nums = arr.filter((x): x is number => typeof x === 'number');
    if (nums.length === 0) return 0;
    return Math.max(...nums) - Math.min(...nums);
  }
});
