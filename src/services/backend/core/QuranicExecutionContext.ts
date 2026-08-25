// ==============================================================================
// ENTERPRISE QURANIC EXECUTION CONTEXT & TELEMETRY DISPATCHER
// Clean Architecture Core Kernel
// ==============================================================================

export type ExecutionLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface TelemetryMetric {
  operationName: string;
  durationMs: number;
  timestamp: number;
  status: 'SUCCESS' | 'FAILURE' | 'DEGRADED';
  metadata?: Record<string, unknown>;
}

export interface ExecutionLogEntry {
  correlationId: string;
  level: ExecutionLogLevel;
  message: string;
  timestamp: string;
  module: string;
  context?: Record<string, unknown>;
}

export class QuranicExecutionContext {
  private static instance: QuranicExecutionContext;
  private logs: ExecutionLogEntry[] = [];
  private metrics: TelemetryMetric[] = [];
  private readonly maxLogRetention = 500;

  private constructor() {}

  public static getInstance(): QuranicExecutionContext {
    if (!QuranicExecutionContext.instance) {
      QuranicExecutionContext.instance = new QuranicExecutionContext();
    }
    return QuranicExecutionContext.instance;
  }

  public generateCorrelationId(prefix = 'QRN-CTX'): string {
    const timeSegment = Date.now().toString(36);
    const randomSegment = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timeSegment}-${randomSegment}`.toUpperCase();
  }

  public async runWithProfiling<T>(
    operationName: string,
    operation: (correlationId: string) => Promise<T> | T,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const correlationId = this.generateCorrelationId();
    const startTime = performance.now();

    this.log('INFO', 'CoreKernel', `Starting operation [${operationName}]`, correlationId, metadata);

    try {
      const result = await operation(correlationId);
      const durationMs = performance.now() - startTime;

      this.recordMetric({
        operationName,
        durationMs,
        timestamp: Date.now(),
        status: 'SUCCESS',
        metadata: { ...metadata, correlationId }
      });

      this.log('INFO', 'CoreKernel', `Completed operation [${operationName}] in ${durationMs.toFixed(2)}ms`, correlationId);
      return result;
    } catch (error) {
      const durationMs = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.recordMetric({
        operationName,
        durationMs,
        timestamp: Date.now(),
        status: 'FAILURE',
        metadata: { ...metadata, correlationId, error: errorMessage }
      });

      this.log('ERROR', 'CoreKernel', `Failed operation [${operationName}]: ${errorMessage}`, correlationId);
      throw error;
    }
  }

  public log(
    level: ExecutionLogLevel,
    module: string,
    message: string,
    correlationId?: string,
    context?: Record<string, unknown>
  ): void {
    const entry: ExecutionLogEntry = {
      correlationId: correlationId || this.generateCorrelationId('SYS-LOG'),
      level,
      message,
      timestamp: new Date().toISOString(),
      module,
      context
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogRetention) {
      this.logs.shift();
    }
  }

  private recordMetric(metric: TelemetryMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxLogRetention) {
      this.metrics.shift();
    }
  }

  public getTelemetrySnapshot(): {
    totalOperations: number;
    averageLatencyMs: number;
    recentLogs: ExecutionLogEntry[];
    recentMetrics: TelemetryMetric[];
  } {
    const totalOps = this.metrics.length;
    const avgLatency = totalOps > 0
      ? this.metrics.reduce((acc, m) => acc + m.durationMs, 0) / totalOps
      : 0;

    return {
      totalOperations: totalOps,
      averageLatencyMs: Number(avgLatency.toFixed(2)),
      recentLogs: [...this.logs].slice(-50),
      recentMetrics: [...this.metrics].slice(-50)
    };
  }

  public clearTelemetry(): void {
    this.logs = [];
    this.metrics = [];
  }
}

export const executionContext = QuranicExecutionContext.getInstance();
