# Formula Functions Registry

This file documents the official, closed set of functions available in the Zenith Formula Engine.

## Text Functions
- `concat(text1, text2)`: Concatenates two text strings.
- `contains(text, match)`: Returns boolean if text contains match.
- `lower(text)` / `upper(text)`: Case conversion.
- `length(text)`: Character count.
- `slice(text, start, end)`: Substring extraction.
- `replace(text, old, new)`: String replacement.
- `trim(text)`: Removes whitespace.

## Number Functions
- `add(x, y)`, `sub(x, y)`, `mul(x, y)`, `div(x, y)`, `mod(x, y)`: Arithmetic.
- `round(x)`, `floor(x)`, `ceil(x)`: Rounding.
- `abs(x)`: Absolute value.
- `min(x, y)`, `max(x, y)`: Extrema.
- `pow(base, exp)`, `sqrt(x)`: Power/roots.

## Date Functions
- `now()`: Current timestamp (injected snapshot).
- `today()`: Current date (in user timezone).
- `dateAdd(date, amount, unit)`: Adds time to date.
- `dateSubtract(date, amount, unit)`: Subtracts time.
- `dateBetween(start, end, unit)`: Difference between dates.
- `formatDate(date, format)`: Converts date to formatted string.
- `year(date)`, `month(date)`, `day(date)`: Date extraction.

## Logic Functions
- `if(condition, trueResult, falseResult)`: Conditional branch.
- `and(a, b)`, `or(a, b)`, `not(a)`: Boolean operations.
- `empty(val)`: Checks for null or undefined.
- `equals(a, b)`: Strict equality check.

## Array & Rollup
- `length(arr)`, `contains(arr, val)`, `join(arr, sep)`
- `count(arr)`, `sum(arr)`, `avg(arr)`, `min(arr)`, `max(arr)`, `percent_checked(arr)`
