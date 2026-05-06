/**
 * Metrics Collector Interface
 * Provides tracking for operation performance and success rates
 */

export interface MetricData {
  operation: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface MetricSummary {
  operation: string;
  count: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
}

export interface IMetricCollector {
  /**
   * Record a metric
   */
  record(metric: MetricData): void;

  /**
   * Get summary statistics for an operation
   */
  getSummary(operation: string): MetricSummary | null;

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): MetricData[];

  /**
   * Clear all metrics
   */
  clear(): void;

  /**
   * Start tracking an operation duration
   * Returns a function that when called, records the duration
   */
  startTimer(operation: string, metadata?: Record<string, unknown>): () => void;
}

/**
 * In-memory metrics collector implementation
 */
export class MetricsCollector implements IMetricCollector {
  private metrics: MetricData[] = [];
  private summaries = new Map<string, MetricSummary>();

  public record(metric: MetricData): void {
    this.metrics.push(metric);
    this.updateSummary(metric);
  }

  public getSummary(operation: string): MetricSummary | null {
    return this.summaries.get(operation) ?? null;
  }

  public getAllMetrics(): MetricData[] {
    return [...this.metrics];
  }

  public clear(): void {
    this.metrics = [];
    this.summaries.clear();
  }

  public startTimer(operation: string, metadata?: Record<string, unknown>): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.record({
        operation,
        duration,
        success: true,
        timestamp: new Date(),
        ...(metadata !== undefined ? { metadata } : {}),
      });
    };
  }

  private updateSummary(metric: MetricData): void {
    let summary = this.summaries.get(metric.operation);

    if (!summary) {
      summary = {
        operation: metric.operation,
        count: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
        minDuration: metric.duration,
        maxDuration: metric.duration,
        successRate: 0,
      };
      this.summaries.set(metric.operation, summary);
    }

    summary.count++;
    if (metric.success) {
      summary.successCount++;
    } else {
      summary.failureCount++;
    }

    // Update duration stats
    summary.minDuration = Math.min(summary.minDuration, metric.duration);
    summary.maxDuration = Math.max(summary.maxDuration, metric.duration);

    // Calculate average duration
    const totalDuration = summary.averageDuration * (summary.count - 1) + metric.duration;
    summary.averageDuration = totalDuration / summary.count;

    // Calculate success rate
    summary.successRate = (summary.successCount / summary.count) * 100;
  }
}

/**
 * Global metrics collector instance
 */
export const metricsCollector = new MetricsCollector();
