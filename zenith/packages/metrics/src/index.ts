/**
 * @zenith/metrics — Prometheus-compatible metrics counters/histograms.
 * W01: Operational metrics for worker, API, and DB.
 */

export interface Counter {
  inc(labels?: Record<string, string>, value?: number): void
  get(labels?: Record<string, string>): number
}

export interface Histogram {
  observe(value: number, labels?: Record<string, string>): void
  percentile(p: number, labels?: Record<string, string>): number
}

// In-memory counters (replaced by real Prometheus client in prod)
const counters = new Map<string, number>()
const histograms = new Map<string, number[]>()

export function createCounter(name: string, _help: string): Counter {
  return {
    inc(labels, value = 1) {
      const key = `${name}:${JSON.stringify(labels ?? {})}`
      counters.set(key, (counters.get(key) ?? 0) + value)
    },
    get(labels) {
      const key = `${name}:${JSON.stringify(labels ?? {})}`
      return counters.get(key) ?? 0
    },
  }
}

export function createHistogram(name: string, _help: string): Histogram {
  return {
    observe(value, labels) {
      const key = `${name}:${JSON.stringify(labels ?? {})}`
      const arr = histograms.get(key) ?? []
      arr.push(value)
      histograms.set(key, arr)
    },
    percentile(p, labels) {
      const key = `${name}:${JSON.stringify(labels ?? {})}`
      const arr = (histograms.get(key) ?? []).sort((a, b) => a - b)
      if (arr.length === 0) return 0
      const idx = Math.floor(arr.length * p)
      return arr[Math.min(idx, arr.length - 1)] ?? 0
    },
  }
}

// Standard Zenith metrics
export const metrics = {
  apiRequests:     createCounter('zenith_api_requests_total', 'Total API requests'),
  apiErrors:       createCounter('zenith_api_errors_total', 'Total API errors'),
  jobsProcessed:   createCounter('zenith_jobs_processed_total', 'Jobs processed by worker'),
  jobsDuration:    createHistogram('zenith_jobs_duration_ms', 'Job processing duration'),
  aiQuotaUsed:     createCounter('zenith_ai_quota_used_total', 'AI quota calls used'),
  vaultOperations: createCounter('zenith_vault_ops_total', 'Vault encrypt/decrypt operations'),
}
