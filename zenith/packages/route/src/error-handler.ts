import 'server-only';
import { AppError } from '@app/result';
import { logger } from '@app/shared/logger';
import { createUlid } from '@app/shared/ids';

export function jsonError(error: unknown, requestId: string): Response {
  if (error instanceof AppError) {
    return Response.json(
      { ok: false, error: error.toEnvelope(), meta: { requestId } },
      { status: error.httpStatus },
    );
  }
  logger.error({ err: error, requestId }, 'unhandled.error');
  return Response.json(
    { ok: false, error: { code: 'SYS_001', message: 'Internal server error', details: null }, meta: { requestId } },
    { status: 500 },
  );
}

export const withApiErrorHandling = (handler: (req: Request, ctx: { requestId: string }) => Promise<Response>) =>
  async (req: Request): Promise<Response> => {
    const requestId = req.headers.get('x-request-id') ?? createUlid();
    try { 
      return await handler(req, { requestId }); 
    } catch (e) { 
      return jsonError(e, requestId); 
    }
  };

export function jsonOk<T>(data: T, requestId: string): Response {
  return Response.json({ ok: true, data, meta: { requestId } });
}
