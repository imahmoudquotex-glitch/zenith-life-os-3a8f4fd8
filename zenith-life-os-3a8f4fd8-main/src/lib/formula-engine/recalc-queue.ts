import { logger } from '../logger';
import { supabase } from '../supabase/client';

export class RecalcQueue {
  /**
   * Enqueue a recalculation job.
   * Uses DB table as queue (Redis fallback per plan).
   */
  public static async enqueue(workspaceId: string, formulaId: string, rowId?: string): Promise<void> {
    const { error } = await supabase.from('recalc_jobs').insert({
      workspace_id: workspaceId,
      formula_id: formulaId,
      row_id: rowId || null,
      status: 'pending'
    });

    if (error) {
      logger.error({ error, formulaId }, 'Failed to enqueue recalc job');
      throw error;
    }
  }

  public static async markProcessing(jobId: string): Promise<void> {
    const { error } = await supabase.from('recalc_jobs').update({
      status: 'processing',
      started_at: new Date().toISOString()
    }).eq('id', jobId);

    if (error) {
      logger.error({ error, jobId }, 'Failed to mark job processing');
      throw error;
    }
  }

  public static async markCompleted(jobId: string): Promise<void> {
    const { error } = await supabase.from('recalc_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', jobId);

    if (error) {
      logger.error({ error, jobId }, 'Failed to mark job completed');
      throw error;
    }
  }

  public static async markFailed(jobId: string, errorMsg: string): Promise<void> {
    const { error } = await supabase.from('recalc_jobs').update({
      status: 'failed',
      error: errorMsg,
      completed_at: new Date().toISOString()
    }).eq('id', jobId);

    if (error) {
      logger.error({ error, jobId }, 'Failed to mark job failed');
      throw error;
    }
  }

  /**
   * Fetch pending jobs for processing (FIFO order).
   */
  public static async fetchPending(limit: number = 10): Promise<Array<{ id: string; formula_id: string; workspace_id: string; row_id: string | null }>> {
    const { data, error } = await supabase
      .from('recalc_jobs')
      .select('id, formula_id, workspace_id, row_id')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error({ error }, 'Failed to fetch pending recalc jobs');
      return [];
    }

    return data ?? [];
  }
}
