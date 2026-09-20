// ==============================================================================
// ENTERPRISE RESILIENT MULTI-TIER STORAGE ADAPTER (v3.0)
// Tier 1: IndexedDB (Asynchronous Indexed B-Tree Persistence)
// Tier 2: LocalStorage (Synchronous JSON Fallback)
// Tier 3: In-Memory Ring Store (Quota-Exceeded / Private-Browsing Anti-Crash)
// Features: Unit-of-Work Transactions with Automatic Rollback & Quota Diagnostics
// ==============================================================================

export type StorageTier = 'INDEXED_DB' | 'LOCAL_STORAGE' | 'MEMORY';

export interface StorageMetrics {
  tier: StorageTier;
  usageBytes: number;
  estimatedQuotaBytes: number;
  healthPercent: number;
  itemCount: number;
}

export interface StorageTransaction {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

class StorageAdapter {
  private static instance: StorageAdapter;
  private readonly DB_NAME = 'quranverse_enterprise_db_v3';
  private readonly STORE_NAME = 'quranverse_keyval_store';
  private readonly DB_VERSION = 1;

  private memoryStore: Map<string, string> = new Map();
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private activeTier: StorageTier = 'INDEXED_DB';

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): StorageAdapter {
    if (!StorageAdapter.instance) {
      StorageAdapter.instance = new StorageAdapter();
    }
    return StorageAdapter.instance;
  }

  private initDatabase(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        this.activeTier = 'LOCAL_STORAGE';
        return resolve(null);
      }

      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME);
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          this.activeTier = 'INDEXED_DB';
          resolve(db);
        };

        request.onerror = () => {
          console.warn('[StorageAdapter] IndexedDB access denied or failed, falling back to LocalStorage');
          this.activeTier = 'LOCAL_STORAGE';
          resolve(null);
        };
      } catch (err) {
        console.warn('[StorageAdapter] IndexedDB init exception, falling back to LocalStorage', err);
        this.activeTier = 'LOCAL_STORAGE';
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Get an item by key across the multi-tier hierarchy
   */
  public async getItem<T>(key: string): Promise<T | null> {
    // 1. Try In-Memory first if active
    if (this.memoryStore.has(key)) {
      try {
        return JSON.parse(this.memoryStore.get(key)!);
      } catch {
        return null;
      }
    }

    // 2. Try IndexedDB
    try {
      const db = await this.initDatabase();
      if (db) {
        return new Promise<T | null>((resolve) => {
          try {
            const tx = db.transaction(this.STORE_NAME, 'readonly');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.get(key);

            req.onsuccess = () => {
              if (req.result !== undefined && req.result !== null) {
                resolve(req.result as T);
              } else {
                // Fallback to LocalStorage if not in IDB
                resolve(this.getFromLocalStorage<T>(key));
              }
            };

            req.onerror = () => {
              resolve(this.getFromLocalStorage<T>(key));
            };
          } catch {
            resolve(this.getFromLocalStorage<T>(key));
          }
        });
      }
    } catch {
      // Fallback
    }

    // 3. Fallback to LocalStorage
    return this.getFromLocalStorage<T>(key);
  }

  private getFromLocalStorage<T>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Set an item with automatic quota protection and graceful degradation
   */
  public async setItem<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);

    // Always mirror in memory map for microsecond read latency
    this.memoryStore.set(key, serialized);

    // Try IndexedDB
    let idbSucceeded = false;
    try {
      const db = await this.initDatabase();
      if (db) {
        idbSucceeded = await new Promise<boolean>((resolve) => {
          try {
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.put(value, key);

            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
          } catch {
            resolve(false);
          }
        });
      }
    } catch {
      idbSucceeded = false;
    }

    // Fallback to LocalStorage if IDB failed or unavailable
    if (!idbSucceeded && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, serialized);
      } catch (err: any) {
        // Quota exceeded: Evict memory or mark tier as MEMORY
        console.warn('[StorageAdapter] LocalStorage quota exceeded, persisting in memory safe-tier', err);
        this.activeTier = 'MEMORY';
      }
    }
  }

  /**
   * Remove an item across all storage tiers
   */
  public async removeItem(key: string): Promise<void> {
    this.memoryStore.delete(key);

    try {
      const db = await this.initDatabase();
      if (db) {
        await new Promise<void>((resolve) => {
          try {
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
          } catch {
            resolve();
          }
        });
      }
    } catch {
      // ignore
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Atomic Unit-of-Work Transaction simulation with Rollback Support
   */
  public async transaction<T>(operations: (tx: StorageTransaction) => Promise<T>): Promise<T> {
    const snapshot = new Map<string, string | null>();

    const txContext: StorageTransaction = {
      get: async <K>(key: string): Promise<K | null> => {
        return this.getItem<K>(key);
      },
      set: async <K>(key: string, value: K): Promise<void> => {
        if (!snapshot.has(key)) {
          const current = await this.getItem<K>(key);
          snapshot.set(key, current ? JSON.stringify(current) : null);
        }
        await this.setItem<K>(key, value);
      },
      remove: async (key: string): Promise<void> => {
        if (!snapshot.has(key)) {
          const current = await this.getItem<any>(key);
          snapshot.set(key, current ? JSON.stringify(current) : null);
        }
        await this.removeItem(key);
      }
    };

    try {
      return await operations(txContext);
    } catch (err) {
      console.warn('[StorageAdapter] Transaction failed! Rolling back changes...', err);
      for (const [key, oldVal] of snapshot.entries()) {
        try {
          if (oldVal === null) {
            await this.removeItem(key);
          } else {
            await this.setItem(key, JSON.parse(oldVal));
          }
        } catch (rbErr) {
          console.error('[StorageAdapter] Rollback error for key', key, rbErr);
        }
      }
      throw err;
    }
  }

  /**
   * Diagnostic metrics on storage tier, capacity and quota
   */
  public async getStorageMetrics(): Promise<StorageMetrics> {
    let usageBytes = 0;
    let quotaBytes = 50 * 1024 * 1024; // 50MB default
    let itemCount = this.memoryStore.size;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usageBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || quotaBytes;
      } catch {
        // ignore
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        let totalChars = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            totalChars += k.length + (localStorage.getItem(k)?.length || 0);
          }
        }
        usageBytes = totalChars * 2; // UTF-16 bytes
        quotaBytes = 5 * 1024 * 1024; // 5MB localStorage limit
        itemCount = localStorage.length;
      } catch {
        // ignore
      }
    }

    const healthPercent = quotaBytes > 0 
      ? Math.max(0, Math.min(100, Math.round((1 - (usageBytes / quotaBytes)) * 100))) 
      : 100;

    return {
      tier: this.activeTier,
      usageBytes,
      estimatedQuotaBytes: quotaBytes,
      healthPercent,
      itemCount
    };
  }
}

export const storageAdapter = StorageAdapter.getInstance();
