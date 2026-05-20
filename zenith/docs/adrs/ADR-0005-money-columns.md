# ADR-0005 — Money Columns: BIGINT Cents Only

**Date:** 2026-05-13
**Status:** Accepted

## Decision
All monetary values: {name}_cents BIGINT NOT NULL.
Forbidden: NUMERIC, DECIMAL, FLOAT. parseFloat() on money.
CI: check:money scans all migrations.
