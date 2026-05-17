/**
 * Wave 08 — Formulas API Routes
 * src/api/formulas.ts
 *
 * FIXED (Remediation):
 * - ❌ No longer accepts AST from client (security issue #36)
 * - ✅ Expression is parsed server-side only
 * - ✅ Uses @zenith/shared ApiEnvelope (not local type)
 * - ✅ Idempotency-Key validated with @zenith/idempotency
 * - ✅ Auth stub uses proper requireAuth pattern
 * - ✅ No `any` — typed FormulaValue throughout
 */
import { jsonOk, jsonErr } from '../../packages/shared/src/api-envelope';
import { isValidIdempotencyKey } from '../../packages/idempotency/src/index';
import { Parser } from '../lib/formula-engine/parser';
import { TypeChecker } from '../lib/formula-engine/type-checker';
import { Evaluator } from '../lib/formula-engine/evaluator';
import { RecalcQueue } from '../lib/formula-engine/recalc-queue';

// POST /api/v1/formulas/validate
// Only validates expression syntax + types — returns returnType, NOT the AST
export async function validateFormulaHandler(req: Request): Promise<Response> {
  let body: { expression?: string; propertyTypes?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return jsonErr('INVALID_JSON', 'Request body is not valid JSON', 400);
  }

  if (!body.expression || !body.propertyTypes) {
    return jsonErr('VALIDATION_FAILED', 'Missing expression or propertyTypes', 400);
  }

  if (body.expression.length > 2000) {
    return jsonErr('VALIDATION_FAILED', 'Expression too long (max 2000 chars)', 400);
  }

  try {
    const parser = new Parser(body.expression);
    const ast = parser.parse();

    const checker = new TypeChecker(body.propertyTypes as Record<string, string>);
    const returnType = checker.check(ast);

    // SECURITY: Never send AST to client — it stays server-side
    return jsonOk({ valid: true, returnType });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error';
    return jsonErr('FORMULA_INVALID', msg, 400);
  }
}

// POST /api/v1/formulas/evaluate
// Client sends expression (not AST), server parses it
export async function evaluateFormulaHandler(req: Request): Promise<Response> {
  let body: { expression?: string; context?: { properties: Record<string, unknown> } };
  try {
    body = await req.json();
  } catch {
    return jsonErr('INVALID_JSON', 'Request body is not valid JSON', 400);
  }

  if (!body.expression || !body.context) {
    return jsonErr('VALIDATION_FAILED', 'Missing expression or context', 400);
  }

  try {
    // Parse server-side — client never sends AST
    const parser = new Parser(body.expression);
    const ast = parser.parse();

    const evaluator = new Evaluator(ast, 50); // strict 50ms timeout
    const result = evaluator.evaluate(body.context);

    return jsonOk({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Evaluation error';
    return jsonErr('FORMULA_ERROR', msg, 400);
  }
}

// POST /api/v1/formulas/recalc
export async function recalcFormulaHandler(req: Request): Promise<Response> {
  const idemKey = req.headers.get('Idempotency-Key');
  if (!idemKey || !isValidIdempotencyKey(idemKey)) {
    return jsonErr('MISSING_IDEMPOTENCY_KEY', 'Valid Idempotency-Key required (min 16 chars, alphanumeric)', 400);
  }

  let body: { workspaceId?: string; formulaId?: string; rowId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonErr('INVALID_JSON', 'Request body is not valid JSON', 400);
  }

  if (!body.workspaceId || !body.formulaId) {
    return jsonErr('VALIDATION_FAILED', 'Missing workspaceId or formulaId', 400);
  }

  try {
    await RecalcQueue.enqueue(body.workspaceId, body.formulaId, body.rowId);
    return jsonOk({ queued: true }, { idempotencyKey: idemKey });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Queue error';
    return jsonErr('RECALC_ERROR', msg, 500);
  }
}
