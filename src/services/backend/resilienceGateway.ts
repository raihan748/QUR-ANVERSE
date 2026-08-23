// ==============================================================================
// ENTERPRISE RESILIENCE GATEWAY
// Token Bucket Rate Limiter, 3-State Circuit Breaker, & O(1) LRU Cache
// ==============================================================================

import { CircuitBreakerState, CircuitBreakerMetrics } from '../../types';

// 1. Token Bucket Rate Limiter
export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRateTokensPerSec: number;
  private currentTokens: number;
  private lastRefillTimestampMs: number;

  constructor(capacity = 60, refillRateTokensPerSec = 10) {
    this.capacity = capacity;
    this.refillRateTokensPerSec = refillRateTokensPerSec;
    this.currentTokens = capacity;
    this.lastRefillTimestampMs = Date.now();
  }

  public tryConsume(tokens = 1): { allowed: boolean; remainingTokens: number; retryAfterMs: number } {
    this.refill();

    if (this.currentTokens >= tokens) {
      this.currentTokens -= tokens;
      return { allowed: true, remainingTokens: Math.floor(this.currentTokens), retryAfterMs: 0 };
    }

    const deficit = tokens - this.currentTokens;
    const waitTimeMs = Math.ceil((deficit / this.refillRateTokensPerSec) * 1000);

    return {
      allowed: false,
      remainingTokens: Math.floor(this.currentTokens),
      retryAfterMs: waitTimeMs
    };
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestampMs) / 1000;
    const addedTokens = elapsedSeconds * this.refillRateTokensPerSec;

    this.currentTokens = Math.min(this.capacity, this.currentTokens + addedTokens);
    this.lastRefillTimestampMs = now;
  }
}

// 2. Three-State Circuit Breaker (CLOSED -> OPEN -> HALF_OPEN)
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private failureThreshold: number;
  private recoveryTimeoutMs: number;
  private lastStateChangeTimestamp: number;
  private totalRequests = 0;
  private fallbackCount = 0;

  constructor(failureThreshold = 5, recoveryTimeoutMs = 8000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeoutMs = recoveryTimeoutMs;
    this.lastStateChangeTimestamp = Date.now();
  }

  public async execute<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    this.totalRequests++;
    this.evaluateState();

    if (this.state === 'OPEN') {
      this.fallbackCount++;
      return fallback();
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      this.fallbackCount++;
      return fallback();
    }
  }

  private evaluateState(): void {
    const now = Date.now();
    if (this.state === 'OPEN' && now - this.lastStateChangeTimestamp >= this.recoveryTimeoutMs) {
      this.state = 'HALF_OPEN';
      this.lastStateChangeTimestamp = now;
    }
  }

  private recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.lastStateChangeTimestamp = Date.now();
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.lastStateChangeTimestamp = Date.now();
    }
  }

  public getMetrics(): CircuitBreakerMetrics {
    this.evaluateState();
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastStateChange: new Date(this.lastStateChangeTimestamp).toISOString(),
      totalRequestsHandled: this.totalRequests,
      fallbackTriggeredCount: this.fallbackCount
    };
  }
}

// 3. High-Performance LRU Cache with TTL (Time-To-Live)
interface LRUNode<K, V> {
  key: K;
  value: V;
  expiresAt: number;
  prev: LRUNode<K, V> | null;
  next: LRUNode<K, V> | null;
}

export class LRUCache<K, V> {
  private capacity: number;
  private ttlMs: number;
  private map: Map<K, LRUNode<K, V>> = new Map();
  private head: LRUNode<K, V> | null = null;
  private tail: LRUNode<K, V> | null = null;

  constructor(capacity = 250, ttlMs = 1000 * 60 * 30) {
    this.capacity = capacity;
    this.ttlMs = ttlMs;
  }

  public get(key: K): V | null {
    const node = this.map.get(key);
    if (!node) return null;

    // Check TTL Expiration
    if (Date.now() > node.expiresAt) {
      this.removeNode(node);
      this.map.delete(key);
      return null;
    }

    // Move to head (Most Recently Used)
    this.moveToHead(node);
    return node.value;
  }

  public set(key: K, value: V): void {
    const existing = this.map.get(key);
    const expiresAt = Date.now() + this.ttlMs;

    if (existing) {
      existing.value = value;
      existing.expiresAt = expiresAt;
      this.moveToHead(existing);
      return;
    }

    const newNode: LRUNode<K, V> = {
      key,
      value,
      expiresAt,
      prev: null,
      next: null
    };

    if (this.map.size >= this.capacity && this.tail) {
      this.map.delete(this.tail.key);
      this.removeNode(this.tail);
    }

    this.addToHead(newNode);
    this.map.set(key, newNode);
  }

  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
  }

  private addToHead(node: LRUNode<K, V>): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  public size(): number {
    return this.map.size;
  }
}

export const rateLimiter = new TokenBucketRateLimiter(60, 10);
export const circuitBreaker = new CircuitBreaker(5, 8000);
export const memoryCache = new LRUCache<string, any>(200, 1000 * 60 * 30);
