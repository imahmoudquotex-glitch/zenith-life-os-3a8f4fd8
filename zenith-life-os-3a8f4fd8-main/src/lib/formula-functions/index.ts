/**
 * Formula Functions — Module Index
 * Imports all function categories to populate the registry.
 *
 * Function counts per category:
 * - number: 19 (abs, ceil, floor, round, max, min, pow, sqrt, sign, log, log10, log2, exp, mod, pi, e, clamp, trunc, cbrt)
 * - text: 16 (concat, length, upper, lower, substring, replace, contains, trim, startsWith, endsWith, repeat, padStart, padEnd, split, format, toNumber)
 * - date: 12 (now, dateAdd, dateSubtract, dateBetween, formatDate, year, month, day, hour, minute, toDate, timestamp)
 * - logic: 12 (if, ifs, empty, not, and, or, equal, unequal, larger, smaller, largerEq, smallerEq)
 * - array: 10 (join, unique, includes, sort, reverse, slice, flat, first, last, at)
 * - rollup: 10 (countAll, countValues, countUniqueValues, countEmpty, percentEmpty, percentNotEmpty, sum, average, median, range)
 * TOTAL: 79 functions
 */

import './number';
import './text';
import './date';
import './logic';
import './array';
import './rollup';

export { functionRegistry, getRegisteredCount } from './registry';
export type { FunctionDefinition } from './registry';
