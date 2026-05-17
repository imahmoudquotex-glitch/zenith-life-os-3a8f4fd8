import { supabase } from '../supabase/client';
import { RecalcQueue } from './recalc-queue';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { CacheRepo } from './cache-repo';

export class RecalcWorker {
  // A simplified worker loop for processing DB fallback queue.
  // In production, this would be a long-running Node process or BullMQ consumer.
  
  public static async processNextJob() {
    const { data: jobs, error } = await supabase
      .from('recalc_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error || !jobs || jobs.length === 0) return null;

    const job = jobs[0];
    await RecalcQueue.markProcessing(job.id);

    try {
      // 1. Fetch formula
      const { data: formula } = await supabase
        .from('formula_definitions')
        .select('*')
        .eq('id', job.formula_id)
        .single();
        
      if (!formula) throw new Error('Formula not found');

      const parser = new Parser(formula.expression);
      const ast = parser.parse();

      // 2. Fetch rows
      let rowQuery = supabase.from('db_rows').select('id, data').eq('workspace_id', job.workspace_id);
      if (job.row_id) {
        rowQuery = rowQuery.eq('id', job.row_id);
      }
      
      const { data: rows } = await rowQuery;
      if (!rows) throw new Error('Failed to fetch rows');

      // 3. Evaluate and Cache
      for (const row of rows) {
        try {
          const evaluator = new Evaluator(ast, 50); // 50ms strict timeout
          const context = { properties: row.data };
          const result = evaluator.evaluate(context);
          
          await CacheRepo.upsert(job.workspace_id, job.formula_id, row.id, result);
        } catch (evalError: any) {
          await CacheRepo.upsert(job.workspace_id, job.formula_id, row.id, { error: evalError.message });
        }
      }

      await RecalcQueue.markCompleted(job.id);
      return job.id;
    } catch (e: any) {
      await RecalcQueue.markFailed(job.id, e.message);
      return null;
    }
  }
}
