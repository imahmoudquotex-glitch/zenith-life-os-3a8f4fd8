import { requireWorkspace } from '@app/auth-guard';
import { withApiErrorHandling } from './error-handler';
import { ValidationError } from '@app/result';

export const withWorkspaceRoute = (
  handler: (
    req: Request,
    ctx: { requestId: string; user: { id: string; email: string }; role: string; workspaceId: string }
  ) => Promise<Response>
) =>
  withApiErrorHandling(async (req, ctx) => {
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId');
    if (!workspaceId) throw new ValidationError({ workspaceId: ['Missing parameter'] });

    const { user, role } = await requireWorkspace(workspaceId);
    return handler(req, { ...ctx, user, role, workspaceId });
  });
