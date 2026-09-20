// ==============================================================================
// UNIFIED HYBRID DATABASE MANAGER (v3.0 Enterprise)
// Enterprise Data Layer: Cloud Supabase + Multi-Tier Storage (IndexedDB/Local/Memory)
// ==============================================================================

import { userProfileRepo } from './repositories/UserProfileRepository';
import { murojaahLogRepo } from './repositories/MurojaahLogRepository';
import { spacedRepetitionRepo } from './repositories/SpacedRepetitionRepository';
import { bookmarkRepo } from './repositories/BookmarkRepository';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { storageAdapter, StorageMetrics, StorageTransaction } from './StorageAdapter';

export class DatabaseManager {
  private static instance: DatabaseManager;

  public readonly profiles = userProfileRepo;
  public readonly murojaahLogs = murojaahLogRepo;
  public readonly spacedRepetition = spacedRepetitionRepo;
  public readonly bookmarks = bookmarkRepo;
  public readonly storage = storageAdapter;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getConnectionStatus(): {
    isCloudConnected: boolean;
    mode: 'CLOUD_HYBRID' | 'LOCAL_OFFLINE';
    driver: 'Supabase PostgreSQL' | 'LocalStorage / IndexedDB';
  } {
    const isCloud = isSupabaseConfigured && !!supabase;
    return {
      isCloudConnected: isCloud,
      mode: isCloud ? 'CLOUD_HYBRID' : 'LOCAL_OFFLINE',
      driver: isCloud ? 'Supabase PostgreSQL' : 'LocalStorage / IndexedDB'
    };
  }

  /**
   * Executes atomic Unit-of-Work transactions with automatic rollback on storage failure
   */
  public async transaction<T>(operations: (tx: StorageTransaction) => Promise<T>): Promise<T> {
    return this.storage.transaction(operations);
  }

  /**
   * Evaluates storage tier, quota, usage, and health
   */
  public async getStorageMetrics(): Promise<StorageMetrics> {
    return this.storage.getStorageMetrics();
  }
}

export const dbManager = DatabaseManager.getInstance();
