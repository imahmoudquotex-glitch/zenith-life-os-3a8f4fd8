/**
 * Wave 08 — Formulas API Routes
 * src/api/formulas.ts
 */
import { supabase } from '../lib/auth/supabase';
import { Parser } from '../lib/formula-engine/parser';
import { TypeChecker } from '../lib/formula-engine/type-checker';
import { Evaluator } from '../lib/formula-engine/evaluator';
import { RecalcQueue } from '../lib/formula-engine/recalc-queue';

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string };

async function requireAuth(req: Request): Promise<string> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('UNAUTHORIZED');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error('UNAUTHORIZED');
  return data.user.id;
}

function json<T>(data: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(err: unknown): Response {
  return json({ ok: false, error: err instanceof Error ? err.message : 'Unknown error', code: 'ERROR' }, 400);
}

// POST /api/v1/formulas/validate
export async function validateFormulaHandler(req: Request): Promise<Response> {
  try {
    await requireAuth(req);
    const body = await req.json() as { expression: string; propertyTypes: Record<string, string> };
    if (!body.expression || !body.propertyTypes) throw new Error('Missing expression or propertyTypes');

    const parser = new Parser(body.expression);
    const ast = parser.parse();
    
    const checker = new TypeChecker(body.propertyTypes as any);
    const returnType = checker.check(ast);

    return json({ ok: true, data: { valid: true, ast, returnType } });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/v1/formulas/evaluate
export async function evaluateFormulaHandler(req: Request): Promise<Response> {
  try {
    await requireAuth(req);
    const body = await req.json() as { ast: any; context: any };
    if (!body.ast || !body.context) throw new Error('Missing ast or context');

    const evaluator = new Evaluator(body.ast, 50); // strict 50ms
    const result = evaluator.evaluate(body.context);

    return json({ ok: true, data: { result } });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/v1/formulas/recalc
export async function recalcFormulaHandler(req: Request): Promise<Response> {
  try {
    await requireAuth(req);
    const body = await req.json() as { workspaceId: string; formulaId: string; rowId?: string };
    if (!body.workspaceId || !body.formulaId) throw new Error('Missing workspaceId or formulaId');

    await RecalcQueue.enqueue(body.workspaceId, body.formulaId, body.rowId);

    return json({ ok: true, data: { queued: true } });
  } catch (e) {
    return errorResponse(e);
  }
}
