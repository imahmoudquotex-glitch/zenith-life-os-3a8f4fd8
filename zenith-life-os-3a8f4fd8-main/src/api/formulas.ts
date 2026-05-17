/**
 * Wave 08 — Formulas API Routes
 * src/api/formulas.ts
 *
 * FIXED:
 * - ❌ No longer accepts AST from client (security issue #36)
 * - ✅ Expression is parsed server-side only
 * - ✅ Uses Result pattern instead of throw
 * - ✅ Idempotency-Key required on mutations
 */
import { supabase } from '../lib/auth/supabase';
import { Parser } from '../lib/formula-engine/parser';
import { TypeChecker } from '../lib/formula-engine/type-checker';
import { Evaluator } from '../lib/formula-engine/evaluator';
import { RecalcQueue } from '../lib/formula-engine/recalc-queue';

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string };

function requireAuth(req: Request): { userId: string } | null {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  // Note: in production this should use server-side cookie validation
  return null; // TODO: Wire to @zenith/db server-side auth
}

function requireIdempotencyKey(req: Request): string | null {
  const key = req.headers.get('Idempotency-Key');
  if (!key || key.length < 16) return null;
  return key;
}

function json<T>(data: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST /api/v1/formulas/validate
// Only validates expression syntax + types — returns returnType, NOT the AST
export async function validateFormulaHandler(req: Request): Promise<Response> {
  const body = await req.json() as { expression: string; propertyTypes: Record<string, string> };
  if (!body.expression || !body.propertyTypes) {
    return json({ ok: false, error: 'Missing expression or propertyTypes', code: 'VALIDATION_FAILED' }, 400);
  }

  if (body.expression.length > 2000) {
    return json({ ok: false, error: 'Expression too long (max 2000 chars)', code: 'VALIDATION_FAILED' }, 400);
  }

  try {
    const parser = new Parser(body.expression);
    const ast = parser.parse();

    const checker = new TypeChecker(body.propertyTypes as any);
    const returnType = checker.check(ast);

    // SECURITY: Never send AST to client — it stays server-side
    return json({ ok: true, data: { valid: true, returnType } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error';
    return json({ ok: false, error: msg, code: 'FORMULA_INVALID' }, 400);
  }
}

// POST /api/v1/formulas/evaluate
// FIXED: Client sends expression (not AST), server parses it
export async function evaluateFormulaHandler(req: Request): Promise<Response> {
  const body = await req.json() as { expression: string; context: { properties: Record<string, unknown> } };
  if (!body.expression || !body.context) {
    return json({ ok: false, error: 'Missing expression or context', code: 'VALIDATION_FAILED' }, 400);
  }

  try {
    // Parse server-side — client never sends AST
    const parser = new Parser(body.expression);
    const ast = parser.parse();

    const evaluator = new Evaluator(ast, 50); // strict 50ms timeout
    const result = evaluator.evaluate(body.context);

    return json({ ok: true, data: { result } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Evaluation error';
    return json({ ok: false, error: msg, code: 'FORMULA_ERROR' }, 400);
  }
}

// POST /api/v1/formulas/recalc
export async function recalcFormulaHandler(req: Request): Promise<Response> {
  const idemKey = requireIdempotencyKey(req);
  if (!idemKey) {
    return json({ ok: false, error: 'Idempotency-Key required', code: 'MISSING_IDEMPOTENCY_KEY' }, 400);
  }

  const body = await req.json() as { workspaceId: string; formulaId: string; rowId?: string };
  if (!body.workspaceId || !body.formulaId) {
    return json({ ok: false, error: 'Missing workspaceId or formulaId', code: 'VALIDATION_FAILED' }, 400);
  }

  try {
    await RecalcQueue.enqueue(body.workspaceId, body.formulaId, body.rowId);
    return json({ ok: true, data: { queued: true } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Queue error';
    return json({ ok: false, error: msg, code: 'RECALC_ERROR' }, 500);
  }
}
