/**
 * QURANVERSE ENTERPRISE SECURITY & HARDENING MODULE
 * Comprehensive client-side protection against XSS, Prototype Pollution, ReDoS,
 * Audio Resource Injection, Uncontrolled Memory Leaks, and API Rate Limit Abuses.
 */

// 1. TRUSTED AUDIO DOMAIN WHITELIST (Prevents Audio Resource Injection & Malicious Media Links)
export const TRUSTED_AUDIO_DOMAINS = [
  'everyayah.com',
  'audio.qurancdn.com',
  'cdn.islamic.network',
  'download.quranicaudio.com',
  'ia800301.us.archive.org',
  'archive.org'
] as const;

/**
 * Validates whether an audio URL belongs strictly to an authorized Quranic CDN.
 */
export function isTrustedAudioUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return TRUSTED_AUDIO_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

// 2. HTML ENTITY ESCAPING (Neutralizes DOM-based XSS attacks)
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[&<>"'/]/g, (match) => HTML_ESCAPE_MAP[match] || match);
}

// 3. SAFE SEARCH QUERY SANITIZER (Prevents ReDoS & Special Control Character Exploits)
export function sanitizeSearchQuery(query: string, maxLen = 100): string {
  if (!query || typeof query !== 'string') return '';
  return query
    .replace(/[^\p{L}\p{N}\s\-_'"\(\)\/]/gu, '') // Keep letters (including Arabic unicode), numbers, spaces, basic punctuation
    .trim()
    .substring(0, maxLen);
}

// 4. REGEX ESCAPER (Defends against Regular Expression Denial of Service - ReDoS)
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 5. PROTOTYPE POLLUTION-PROOF JSON PARSER
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') return fallback;
  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
      // Prevent Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(data: unknown): string {
  try {
    return JSON.stringify(data, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
  } catch {
    return '{}';
  }
}

// 6. CRYPTOGRAPHICALLY SECURE ID & TOKEN GENERATOR
export function generateSecureId(prefix = 'qv'): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint8Array(12);
    window.crypto.getRandomValues(buffer);
    const hex = Array.from(buffer, b => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${hex}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// 7. CLIENT-SIDE SLIDING WINDOW RATE LIMITER (Protects against Button Mashing & Microphone Spam)
export class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  /**
   * Checks if an action is allowed based on maximum allowed invocations within a time window.
   * @param actionKey Unique identifier for the action (e.g. 'audio_play', 'supabase_sync')
   * @param maxHits Maximum number of allowed hits
   * @param windowMs Time window in milliseconds
   */
  public isAllowed(actionKey: string, maxHits: number = 10, windowMs: number = 3000): boolean {
    const now = Date.now();
    const history = this.timestamps.get(actionKey) || [];
    
    // Purge expired timestamps
    const activeHistory = history.filter(t => now - t < windowMs);
    
    if (activeHistory.length >= maxHits) {
      this.timestamps.set(actionKey, activeHistory);
      return false; // Rate limit exceeded
    }

    activeHistory.push(now);
    this.timestamps.set(actionKey, activeHistory);
    return true;
  }

  public reset(actionKey?: string): void {
    if (actionKey) {
      this.timestamps.delete(actionKey);
    } else {
      this.timestamps.clear();
    }
  }
}

export const globalRateLimiter = new RateLimiter();

// 8. SAFE AUDIO CONTEXT LIFECYCLE GUARD (Prevents Browser Audio Leaks & Autoplay Crashes)
export class SafeAudioContextGuard {
  private static activeContexts: Set<AudioContext> = new Set();

  public static createSafeAudioContext(): AudioContext | null {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      const ctx = new AudioCtx();
      this.activeContexts.add(ctx);

      // Auto clean-up when closed
      ctx.addEventListener('statechange', () => {
        if (ctx.state === 'closed') {
          this.activeContexts.delete(ctx);
        }
      });

      return ctx;
    } catch (err) {
      console.warn('[SafeAudioContextGuard] Could not initialize AudioContext:', err);
      return null;
    }
  }

  public static async closeAll(): Promise<void> {
    for (const ctx of this.activeContexts) {
      try {
        if (ctx.state !== 'closed') {
          await ctx.close();
        }
      } catch {}
    }
    this.activeContexts.clear();
  }
}
