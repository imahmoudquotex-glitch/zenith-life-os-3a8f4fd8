-- Migration 0806: recalc_metrics

CREATE VIEW recalc_metrics AS
SELECT 
    workspace_id,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_jobs,
    COUNT(*) FILTER (WHERE status = 'processing') AS processing_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_jobs,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) AS avg_duration_seconds
FROM recalc_jobs
GROUP BY workspace_id;
