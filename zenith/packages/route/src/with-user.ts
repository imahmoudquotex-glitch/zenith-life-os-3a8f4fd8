import { requireUser } from '@app/auth-guard';
import { withApiErrorHandling } from './error-handler';

export const withUserRoute = (
  handler: (req: Request, ctx: { requestId: string; user: { id: string; email: string } }) => Promise<Response>
) =>
  withApiErrorHandling(async (req, ctx) => {
    const user = await requireUser();
    return handler(req, { ...ctx, user });
  });
