// ==============================================================================
// UNIFIED HYBRID DATABASE MANAGER
// Enterprise Data Layer: Cloud Supabase + Local IndexedDB Storage
// ==============================================================================

import { userProfileRepo } from './repositories/UserProfileRepository';
import { murojaahLogRepo } from './repositories/MurojaahLogRepository';
import { spacedRepetitionRepo } from './repositories/SpacedRepetitionRepository';
import { bookmarkRepo } from './repositories/BookmarkRepository';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export class DatabaseManager {
  private static instance: DatabaseManager;

  public readonly profiles = userProfileRepo;
  public readonly murojaahLogs = murojaahLogRepo;
  public readonly spacedRepetition = spacedRepetitionRepo;
  public readonly bookmarks = bookmarkRepo;

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
}

export const dbManager = DatabaseManager.getInstance();
