// ==============================================================================
// TAJWID RULE PIPELINE & MIDDLEWARE CHAIN ARCHITECTURE
// Extensible Rule Verification Interceptors
// ==============================================================================

import { TajwidToken } from '../../../types';

export interface TajwidPipelineContext {
  surahNumber: number;
  ayahNumber: number;
  rawArabic: string;
  tokens: TajwidToken[];
  totalBeats: number;
  metadata: Record<string, unknown>;
}

export interface ITajwidPipelineMiddleware {
  name: string;
  process(context: TajwidPipelineContext, next: () => Promise<void> | void): Promise<void> | void;
}

export class TajwidPipelineEngine {
  private middlewares: ITajwidPipelineMiddleware[] = [];

  public use(middleware: ITajwidPipelineMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  public async execute(context: TajwidPipelineContext): Promise<TajwidPipelineContext> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const currentMiddleware = this.middlewares[index++];
        await currentMiddleware.process(context, next);
      }
    };

    await next();
    return context;
  }
}
