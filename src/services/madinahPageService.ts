import mushaf15LinesData from '../data/mushaf15LinesData.json';
import { SURAH_LIST } from '../data/quranData';
import { SurahMeta } from '../types';

export interface MushafLine {
  line: number;
  type: 'text' | 'surah-header' | 'basmala';
  text?: string;
  surahName?: string;
  verseRange?: string;
}

export interface PageSurahRange {
  surahNumber: number;
  surahLatin: string;
  surahArabic: string;
  startAyah: number;
  endAyah: number;
}

const rawPagesData = mushaf15LinesData as Record<string, MushafLine[]>;

/**
 * Returns the exact 15-line layout array for any page from 1 to 604.
 * 100% offline, guaranteed exact line-by-line Rasm Utsmani Madinah Mushaf.
 */
export function getMadinahPageLines(page: number): MushafLine[] {
  const safePage = Math.max(1, Math.min(604, page));
  const lines = rawPagesData[String(safePage)] || rawPagesData[safePage];
  if (lines && Array.isArray(lines) && lines.length > 0) {
    return lines;
  }
  return [];
}

/**
 * Extracts all surahs and their ayah ranges present on the requested page.
 * Example for Page 2: [{ surahNumber: 2, surahLatin: 'Al-Baqarah', startAyah: 1, endAyah: 5 }]
 * Example for Page 604: [Al-Ikhlas (1-4), Al-Falaq (1-5), An-Nas (1-6)]
 */
export function getMadinahPageSurahs(page: number, fallbackSurah?: SurahMeta): PageSurahRange[] {
  const lines = getMadinahPageLines(page);
  const map = new Map<number, { startAyah: number; endAyah: number }>();

  lines.forEach((l) => {
    if (l.verseRange) {
      const parts = l.verseRange.split('-');
      parts.forEach((p) => {
        const [sStr, aStr] = p.trim().split(':');
        const sNo = parseInt(sStr, 10);
        const aNo = parseInt(aStr, 10);
        if (!isNaN(sNo) && !isNaN(aNo)) {
          if (!map.has(sNo)) {
            map.set(sNo, { startAyah: aNo, endAyah: aNo });
          } else {
            const e = map.get(sNo)!;
            e.startAyah = Math.min(e.startAyah, aNo);
            e.endAyah = Math.max(e.endAyah, aNo);
          }
        }
      });
    }
  });

  if (map.size === 0) {
    const sMeta = fallbackSurah || SURAH_LIST[0];
    return [{
      surahNumber: sMeta.number,
      surahLatin: sMeta.latinName,
      surahArabic: sMeta.name,
      startAyah: 1,
      endAyah: sMeta.ayahCount
    }];
  }

  const result: PageSurahRange[] = [];
  map.forEach((range, sNo) => {
    const meta = SURAH_LIST.find((s) => s.number === sNo) || fallbackSurah || SURAH_LIST[0];
    result.push({
      surahNumber: sNo,
      surahLatin: meta.latinName,
      surahArabic: meta.name,
      startAyah: range.startAyah,
      endAyah: range.endAyah
    });
  });

  return result.sort((a, b) => a.surahNumber - b.surahNumber);
}
