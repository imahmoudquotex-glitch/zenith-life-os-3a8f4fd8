# License Allowlist Policy

Phase 0/1 invariant: Strict supply chain control. We only allow permissive open-source licenses to guarantee no copyleft contagion (e.g. GPL, AGPL) in our core platform.

## Allowed Licenses
- `MIT`
- `Apache-2.0`
- `BSD-2-Clause`
- `BSD-3-Clause`
- `ISC`
- `0BSD`
- `CC-BY-4.0`
- `CC0-1.0`
- `Zlib`
- `Unlicense`
- `Python-2.0`
- `MPL-2.0`
- `BlueOak-1.0.0`

## Prohibited Licenses
- `GPL` (all versions)
- `AGPL` (all versions)
- `LGPL` (all versions)
- `SSPL`
- `Elastic License`

## Rationale for Exceptions
- **MPL-2.0**: Accepted for transitive/runtime dependencies only, subject to review. It is a weak copyleft license applied at the file level. It does not infect the broader project but obligations increase if modified.
- **BlueOak-1.0.0**: Accepted for direct and transitive dependencies. A modern, highly permissive license drafted by lawyers to be clearer than MIT. Safe and fully compatible with our zero-trust constraints.
