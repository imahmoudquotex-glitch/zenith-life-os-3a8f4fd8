import { type ZodSchema } from 'zod';
import { ValidationError } from '@app/result';

export async function parseJsonBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try { 
    raw = await req.json(); 
  } catch { 
    throw new ValidationError({ body: ['Invalid JSON'] }); 
  }
  
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.flatten().fieldErrors);
  }
  
  return parsed.data;
}
