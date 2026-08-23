// ==============================================================================
// TAJWID RULE FORMAL VERIFICATION ENGINE & AST TOKENIZER
// Mathematical & Linguistic Abstract Syntax Tree (AST) Parser for Tajwid Rules
// ==============================================================================

import { TajwidAnalysisResult, TajwidRuleType, TajwidToken } from '../../types';

// Arabic Unicode Character Classes & Constants
const NUN_SUKUN_CHARS = ['ن', 'نْ'];
const TANWIN_CHARS = ['\u064B', '\u064C', '\u064D']; // Fathatain, Dammatain, Kasratain
const SUKUN_CHAR = '\u0652';
const SHADDAH_CHAR = '\u0651';
const MADDAH_CHAR = '\u0653'; // Super-script wavy maddah mark (آ / ـٓ)

// Letter Groupings for Tajwid Grammar
const HALQI_LETTERS = ['ء', 'ه', 'ع', 'ح', 'غ', 'خ', 'أ', 'إ', 'آ', 'ٱ'];
const IDGHAM_BIGHUNNAH_LETTERS = ['ي', 'ن', 'م', 'و'];
const IDGHAM_BILAGHUNNAH_LETTERS = ['ل', 'ر'];
const IQLAB_LETTERS = ['ب'];
const IKHFA_HAQIQI_LETTERS = ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'];
const QALQALAH_LETTERS = ['ق', 'ط', 'ب', 'ج', 'د'];
const MAD_LETTERS = ['ا', 'و', 'ي', 'ى', 'ٱ'];

export class TajwidRuleEngine {
  /**
   * Performs deep AST lexical tokenization on raw Quranic text.
   * Emits formal Tajwid tokens with character offsets, rules, beat counts, and color styling.
   */
  public analyzeAyat(surahNumber: number, ayahNumber: number, rawArabic: string): TajwidAnalysisResult {
    const tokens: TajwidToken[] = [];
    const ruleSummary: Record<TajwidRuleType, number> = {
      idgham_bighunnah: 0,
      idgham_bilaghunnah: 0,
      iqlab: 0,
      ikhfa_haqiqi: 0,
      izhar_halqi: 0,
      mad_thobi_i: 0,
      mad_wajib_muttashil: 0,
      mad_jaiz_munfashil: 0,
      mad_lazim: 0,
      mad_arid_lissukun: 0,
      qalqalah_sugra: 0,
      qalqalah_kubra: 0,
      ghunnah_musyaddadah: 0,
      ikhfa_syafawi: 0,
      idgham_mimi: 0,
      izhar_syafawi: 0
    };

    let totalBeats = 0;
    const len = rawArabic.length;

    // Helper: Strip spaces to inspect lookahead
    const getNextNonSpaceChar = (fromIdx: number): { char: string; index: number } | null => {
      for (let i = fromIdx + 1; i < len; i++) {
        const c = rawArabic[i];
        if (c !== ' ' && c !== '\n' && c !== '\t') {
          return { char: c, index: i };
        }
      }
      return null;
    };

    // Parser Loop
    for (let i = 0; i < len; i++) {
      const currentChar = rawArabic[i];
      const nextChar = rawArabic[i + 1] || '';
      const thirdChar = rawArabic[i + 2] || '';

      // 1. Ghunnah Musyaddadah: Nun (ن) or Mim (م) with Shaddah (ّ)
      if ((currentChar === 'ن' || currentChar === 'م') && (nextChar === SHADDAH_CHAR || thirdChar === SHADDAH_CHAR)) {
        tokens.push({
          index: i,
          char: currentChar,
          rule: 'ghunnah_musyaddadah',
          ruleLabel: 'Ghunnah Musyaddadah',
          description: `Huruf ${currentChar} bertasydid wajib dibaca mendengung (ghunnah) sempurna selama 2-3 harakat.`,
          colorHex: '#10B981', // Emerald Green
          harakatDuration: 3,
          startOffset: i,
          endOffset: i + 2,
          matchedPhoneme: currentChar + 'ّ'
        });
        ruleSummary.ghunnah_musyaddadah++;
        totalBeats += 3;
        continue;
      }

      // 2. Qalqalah: Baju Di Toko (ب, ج, د, ط, ق) with sukun or at end of verse
      if (QALQALAH_LETTERS.includes(currentChar)) {
        const isSukun = nextChar === SUKUN_CHAR;
        const isEndOfAyah = i >= len - 3 || !getNextNonSpaceChar(i);

        if (isEndOfAyah) {
          tokens.push({
            index: i,
            char: currentChar,
            rule: 'qalqalah_kubra',
            ruleLabel: 'Qalqalah Kubra',
            description: `Huruf ${currentChar} berada di akhir waqaf ayat, wajib dipantulkan dengan getaran kuat dan tebal.`,
            colorHex: '#EF4444', // Crimson Red
            harakatDuration: 2,
            startOffset: i,
            endOffset: i + 1,
            matchedPhoneme: currentChar
          });
          ruleSummary.qalqalah_kubra++;
          totalBeats += 2;
          continue;
        } else if (isSukun) {
          tokens.push({
            index: i,
            char: currentChar,
            rule: 'qalqalah_sugra',
            ruleLabel: 'Qalqalah Sughra',
            description: `Huruf ${currentChar} bersukun di tengah kata, dipantulkan ringan dan mengalir.`,
            colorHex: '#F97316', // Orange
            harakatDuration: 1,
            startOffset: i,
            endOffset: i + 1,
            matchedPhoneme: currentChar + 'ْ'
          });
          ruleSummary.qalqalah_sugra++;
          totalBeats += 1;
          continue;
        }
      }

      // 3. Nun Sukun (نْ / ن) & Tanwin (ً, ٍ, ٌ) Rules
      const isNunSukun = currentChar === 'ن' && (nextChar === SUKUN_CHAR || nextChar === ' ' || !['\u064E', '\u064F', '\u0650'].includes(nextChar));
      const isTanwin = TANWIN_CHARS.includes(currentChar);

      if (isNunSukun || isTanwin) {
        const lookahead = getNextNonSpaceChar(isNunSukun ? (nextChar === SUKUN_CHAR ? i + 1 : i) : i);

        if (lookahead) {
          const targetLetter = lookahead.char;

          // A. Iqlab (Nun sukun / tanwin bertemu Ba ب)
          if (IQLAB_LETTERS.includes(targetLetter)) {
            tokens.push({
              index: i,
              char: isNunSukun ? 'ن' : currentChar,
              rule: 'iqlab',
              ruleLabel: 'Iqlab',
              description: `Nun mati/tanwin bertemu huruf ${targetLetter}, suara 'N' diganti menjadi 'M' mendengung rapat selama 2 harakat.`,
              colorHex: '#8B5CF6', // Purple
              harakatDuration: 2,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: (isNunSukun ? 'ن' : 'ـً') + ' + ' + targetLetter
            });
            ruleSummary.iqlab++;
            totalBeats += 2;
            continue;
          }

          // B. Idgham Bighunnah (bertemu ي, ن, م, و)
          if (IDGHAM_BIGHUNNAH_LETTERS.includes(targetLetter)) {
            tokens.push({
              index: i,
              char: isNunSukun ? 'ن' : currentChar,
              rule: 'idgham_bighunnah',
              ruleLabel: 'Idgham Bighunnah',
              description: `Nun mati/tanwin melebur ke huruf ${targetLetter} disertai dengung panjang 2 harakat.`,
              colorHex: '#06B6D4', // Cyan
              harakatDuration: 2,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: (isNunSukun ? 'ن' : 'ـً') + ' + ' + targetLetter
            });
            ruleSummary.idgham_bighunnah++;
            totalBeats += 2;
            continue;
          }

          // C. Idgham Bilaghunnah (bertemu ل, ر)
          if (IDGHAM_BILAGHUNNAH_LETTERS.includes(targetLetter)) {
            tokens.push({
              index: i,
              char: isNunSukun ? 'ن' : currentChar,
              rule: 'idgham_bilaghunnah',
              ruleLabel: 'Idgham Bilaghunnah',
              description: `Nun mati/tanwin melebur sempurna ke huruf ${targetLetter} tanpa dengung sama sekali (1 harakat).`,
              colorHex: '#3B82F6', // Blue
              harakatDuration: 1,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: (isNunSukun ? 'ن' : 'ـً') + ' + ' + targetLetter
            });
            ruleSummary.idgham_bilaghunnah++;
            totalBeats += 1;
            continue;
          }

          // D. Izhar Halqi (bertemu huruf tenggorokan: ء, ه, ع, ح, غ, خ)
          if (HALQI_LETTERS.includes(targetLetter)) {
            tokens.push({
              index: i,
              char: isNunSukun ? 'ن' : currentChar,
              rule: 'izhar_halqi',
              ruleLabel: 'Izhar Halqi',
              description: `Nun mati/tanwin dibaca sangat jelas, tegas dan tidak berdengung saat bertemu huruf halq (${targetLetter}).`,
              colorHex: '#F59E0B', // Amber
              harakatDuration: 1,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: (isNunSukun ? 'ن' : 'ـً') + ' + ' + targetLetter
            });
            ruleSummary.izhar_halqi++;
            totalBeats += 1;
            continue;
          }

          // E. Ikhfa Haqiqi (bertemu 15 huruf ikhfa)
          if (IKHFA_HAQIQI_LETTERS.includes(targetLetter)) {
            tokens.push({
              index: i,
              char: isNunSukun ? 'ن' : currentChar,
              rule: 'ikhfa_haqiqi',
              ruleLabel: 'Ikhfa Haqiqi',
              description: `Nun mati/tanwin disamarkan menuju makhraj ${targetLetter} dengan dengung halus 2 harakat.`,
              colorHex: '#EC4899', // Pink
              harakatDuration: 2,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: (isNunSukun ? 'ن' : 'ـً') + ' + ' + targetLetter
            });
            ruleSummary.ikhfa_haqiqi++;
            totalBeats += 2;
            continue;
          }
        }
      }

      // 4. Mim Sukun (مْ) Rules
      if (currentChar === 'م' && (nextChar === SUKUN_CHAR || nextChar === ' ')) {
        const lookahead = getNextNonSpaceChar(nextChar === SUKUN_CHAR ? i + 1 : i);
        if (lookahead) {
          if (lookahead.char === 'ب') {
            tokens.push({
              index: i,
              char: 'م',
              rule: 'ikhfa_syafawi',
              ruleLabel: 'Ikhfa Syafawi',
              description: `Mim mati bertemu Ba (ب), bibir dirapatkan ringan dan didengungkan 2 harakat.`,
              colorHex: '#D946EF',
              harakatDuration: 2,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: 'مْ + ب'
            });
            ruleSummary.ikhfa_syafawi++;
            totalBeats += 2;
            continue;
          } else if (lookahead.char === 'م') {
            tokens.push({
              index: i,
              char: 'م',
              rule: 'idgham_mimi',
              ruleLabel: 'Idgham Mimi / Mutamatsilain',
              description: `Mim mati melebur ke Mim berikutnya dengan ghunnah sempurna 2 harakat.`,
              colorHex: '#14B8A6',
              harakatDuration: 2,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: 'مْ + م'
            });
            ruleSummary.idgham_mimi++;
            totalBeats += 2;
            continue;
          } else if (!['\u064E', '\u064F', '\u0650'].includes(lookahead.char)) {
            tokens.push({
              index: i,
              char: 'م',
              rule: 'izhar_syafawi',
              ruleLabel: 'Izhar Syafawi',
              description: `Mim mati dibaca jelas di bibir tanpa dengung.`,
              colorHex: '#64748B',
              harakatDuration: 1,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: 'مْ + ' + lookahead.char
            });
            ruleSummary.izhar_syafawi++;
            totalBeats += 1;
            continue;
          }
        }
      }

      // 5. Mad Rules (Panjang Bacaan)
      if (currentChar === MADDAH_CHAR || nextChar === MADDAH_CHAR) {
        tokens.push({
          index: i,
          char: currentChar,
          rule: 'mad_wajib_muttashil',
          ruleLabel: 'Mad Wajib Muttashil / Jaiz Munfashil',
          description: 'Terdapat tanda bendera mad panjang, wajib dibaca 4 sampai 5 harakat (ketukan).',
          colorHex: '#DC2626',
          harakatDuration: 5,
          startOffset: i,
          endOffset: i + 2,
          matchedPhoneme: 'ـٓ'
        });
        ruleSummary.mad_wajib_muttashil++;
        totalBeats += 5;
        continue;
      }
    }

    const astTree = {
      surah: surahNumber,
      ayah: ayahNumber,
      totalLength: len,
      totalRules: tokens.length,
      rules: tokens.map((t) => ({
        type: t.rule,
        label: t.ruleLabel,
        pos: [t.startOffset, t.endOffset],
        beats: t.harakatDuration,
        phoneme: t.matchedPhoneme
      }))
    };

    return {
      surahNumber,
      ayahNumber,
      rawArabic,
      normalizedArabic: rawArabic.replace(/[\u064B-\u065F\u0670]/g, ''),
      tokens,
      ruleSummary,
      totalRulesDetected: tokens.length,
      expectedHarakatTotalBeats: totalBeats,
      astTreeJson: JSON.stringify(astTree, null, 2)
    };
  }
}

export const tajwidEngine = new TajwidRuleEngine();
