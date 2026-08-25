// ==============================================================================
// BOOKMARK & READING HISTORY REPOSITORY
// Data Access Object for Physical Mushaf Pointers & Saved Verses
// ==============================================================================

import { DBBookmark } from '../schema';
import { supabase } from '../../supabaseClient';
import { getBookmarks, saveBookmark, removeBookmark } from '../../offlineStorage';
import { Bookmark } from '../../../types';

export class BookmarkRepository {
  public async getBookmarksList(userId?: string): Promise<Bookmark[]> {
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            surahNumber: d.surah_number,
            ayahNumber: d.ayah_number,
            surahName: d.label || `Surah ${d.surah_number}`,
            arabicText: '',
            translation: '',
            createdAt: d.created_at || new Date().toISOString(),
            note: d.notes
          }));
        }
      } catch (err) {
        console.warn('BookmarkRepository: Falling back to local offline bookmarks', err);
      }
    }

    return getBookmarks();
  }

  public async addBookmark(bookmark: Bookmark, userId?: string): Promise<boolean> {
    saveBookmark({
      surahNumber: bookmark.surahNumber,
      ayahNumber: bookmark.ayahNumber,
      surahName: bookmark.surahName,
      arabicText: bookmark.arabicText,
      translation: bookmark.translation,
      note: bookmark.note
    });

    if (supabase && userId) {
      try {
        const payload: DBBookmark = {
          user_id: userId,
          page_number: 1,
          surah_number: bookmark.surahNumber,
          ayah_number: bookmark.ayahNumber,
          label: bookmark.surahName,
          notes: bookmark.note,
          created_at: bookmark.createdAt
        };

        const { error } = await supabase.from('bookmarks').insert(payload);
        return !error;
      } catch (err) {
        console.warn('BookmarkRepository: Failed adding bookmark to cloud', err);
        return false;
      }
    }

    return true;
  }

  public async deleteBookmark(bookmarkId: string): Promise<boolean> {
    removeBookmark(bookmarkId);

    if (supabase) {
      try {
        const { error } = await supabase.from('bookmarks').delete().eq('id', bookmarkId);
        return !error;
      } catch (err) {
        console.warn('BookmarkRepository: Failed deleting cloud bookmark', err);
        return false;
      }
    }

    return true;
  }
}

export const bookmarkRepo = new BookmarkRepository();
