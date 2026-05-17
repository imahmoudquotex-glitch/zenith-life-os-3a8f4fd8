import { supabase } from '../supabase/client';

export class RecalcQueue {
  // Using DB fallback for enqueueing jobs per plan
  public static async enqueue(workspaceId: string, formulaId: string, rowId?: string) {
    const { error } = await supabase.from('recalc_jobs').insert({
      workspace_id: workspaceId,
      formula_id: formulaId,
      row_id: rowId || null,
      status: 'pending'
    });

    if (error) {
      console.error('Failed to enqueue recalc job', error);
      throw error;
    }
  }

  public static async markProcessing(jobId: string) {
    await supabase.from('recalc_jobs').update({
      status: 'processing',
      started_at: new Date().toISOString()
    }).eq('id', jobId);
  }

  public static async markCompleted(jobId: string) {
    await supabase.from('recalc_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', jobId);
  }

  public static async markFailed(jobId: string, errorMsg: string) {
    await supabase.from('recalc_jobs').update({
      status: 'failed',
      error: errorMsg,
      completed_at: new Date().toISOString()
    }).eq('id', jobId);
  }
}
