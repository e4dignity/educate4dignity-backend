import { Registry, collectDefaultMetrics, Histogram, Counter } from 'prom-client';

// Single registry used across the app so /metrics exposes everything
export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

// HTTP duration histogram (already used in middleware in main.ts)
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

// Domain-specific counters
export const blogViewsTotal = new Counter({
  name: 'blog_views_total',
  help: 'Total number of blog post views tracked',
  registers: [metricsRegistry],
});

export const lessonViewsTotal = new Counter({
  name: 'lesson_views_total',
  help: 'Total number of e-learning lesson views tracked',
  registers: [metricsRegistry],
});
