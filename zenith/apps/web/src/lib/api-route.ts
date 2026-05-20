/**
 * API Route helper — withEnvelope + error handling.
 * Every Route Handler MUST use this wrapper (enforced by check-routes-envelope.ts).
 */
import { type NextRequest, NextResponse } from 'next/server'
import { respondOk, respondErr, ZenithError, createUlid } from '@zenith/shared'

type RouteContext = {
  params: Promise<Record<string, string>>
}

type RouteHandler = (
  req: NextRequest,
  ctx: RouteContext,
) => Promise<NextResponse>

/**
 * Wrap a Route Handler with:
 * - Standardised JSON envelope (ok/error)
 * - ZenithError → HTTP status mapping
 * - Request ID injection
 * - Unexpected error normalisation
 */
export function withEnvelope(
  handler: (req: NextRequest, ctx: RouteContext, requestId: string) => Promise<unknown>,
): RouteHandler {
  return async (req, ctx) => {
    const requestId = createUlid()

    try {
      const data = await handler(req, ctx, requestId)
      return NextResponse.json(respondOk(data, requestId), { status: 200 })
    } catch (err) {
      if (err instanceof ZenithError) {
        return NextResponse.json(
          respondErr(err.code, err.message, requestId, { retry: err.retry }),
          { status: err.httpStatus },
        )
      }

      // Unexpected error — log and return 500
      console.error('[withEnvelope] unhandled error', err)
      return NextResponse.json(
        respondErr('SYS_001', 'Internal server error', requestId, { retry: true }),
        { status: 500 },
      )
    }
  }
}

/**
 * Idempotency key extractor.
 * For POST/PATCH/PUT/DELETE — return idempotency key from header.
 */
export function withIdempotency(req: NextRequest): string {
  const key = req.headers.get('Idempotency-Key')
  if (!key) {
    throw new ZenithError('DATA_002', 'Idempotency-Key header is required for mutations')
  }
  return key
}
