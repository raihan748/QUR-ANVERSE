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
const QAMARIYAH_LETTERS = ['ا', 'ب', 'غ', 'ح', 'ج', 'ك', 'و', 'خ', 'ف', 'ع', 'ق', 'ي', 'م', 'ه', 'أ', 'إ', 'ء'];
const SYAMSIYAH_LETTERS = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'];

export class TajwidRuleEngine {
  /**
   * Performs deep AST lexical tokenization on raw Quranic text.
   * Emits formal Tajwid tokens with character offsets, rules, beat counts, and color styling.
   */
  public analyzeAyat(surahNumber: number, ayahNumber: number, rawArabic: string): TajwidAnalysisResult {
    const safeArabic = String(rawArabic || '').trim();
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
      izhar_syafawi: 0,
      idzhar_qamariyah: 0,
      idgham_syamsiyah: 0,
      lam_jalalah_tafkhim: 0,
      lam_jalalah_tarqiq: 0,
      ra_tafkhim: 0,
      ra_tarqiq: 0
    };

    let totalBeats = 0;
    const len = safeArabic.length;
    if (len === 0) {
      return {
        surahNumber,
        ayahNumber,
        rawArabic: '',
        normalizedArabic: '',
        tokens: [],
        ruleSummary,
        totalRulesDetected: 0,
        expectedHarakatTotalBeats: 0,
        astTreeJson: '{}'
      };
    }

    // Helper: Strip spaces to inspect lookahead
    const getNextNonSpaceChar = (fromIdx: number): { char: string; index: number } | null => {
      for (let i = fromIdx + 1; i < len; i++) {
        const c = safeArabic[i];
        if (c !== ' ' && c !== '\n' && c !== '\t') {
          return { char: c, index: i };
        }
      }
      return null;
    };

    // Parser Loop
    for (let i = 0; i < len; i++) {
      const currentChar = safeArabic[i];
      const nextChar = safeArabic[i + 1] || '';
      const thirdChar = safeArabic[i + 2] || '';

      // 1. Ghunnah Musyaddadah: Nun (ن) or Mim (م) with Shaddah (ّ) directly on itself
      const isNunOrMim = currentChar === 'ن' || currentChar === 'م';
      const hasDirectShaddah = nextChar === SHADDAH_CHAR;
      if (isNunOrMim && hasDirectShaddah) {
        tokens.push({
          index: i,
          char: currentChar,
          rule: 'ghunnah_musyaddadah',
          ruleLabel: 'Ghunnah Musyaddadah',
          description: `Huruf ${currentChar} bertasydid wajib dibaca mendengung (ghunnah) sempurna selama 2-3 harakat.`,
          colorHex: '#10B981', // Emerald Green
          harakatDuration: 3,
          startOffset: i,
          endOffset: i + 1,
          matchedPhoneme: currentChar + 'ّ'
        });
        ruleSummary.ghunnah_musyaddadah++;
        totalBeats += 3;
        continue;
      }

      // 2. Qalqalah: Baju Di Toko (ب, ج, د, ط, ق) with sukun or at end of verse
      if (QALQALAH_LETTERS.includes(currentChar)) {
        const isSukun = nextChar === SUKUN_CHAR || nextChar === '\u06DF';
        const isEndOfAyah = i >= len - 3 || !getNextNonSpaceChar(i);

        if (isEndOfAyah && nextChar !== SHADDAH_CHAR && !['\u064E', '\u064F', '\u0650'].includes(nextChar)) {
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
      const isNunSukun = currentChar === 'ن' && (nextChar === SUKUN_CHAR || nextChar === '\u06DF' || (nextChar !== SHADDAH_CHAR && !['\u064E', '\u064F', '\u0650', '\u064B', '\u064C', '\u064D', '\u0651'].includes(nextChar) && [' ', '\n', '\t'].includes(nextChar)));
      const isTanwin = TANWIN_CHARS.includes(currentChar);

      if (isNunSukun || isTanwin) {
        const lookahead = getNextNonSpaceChar(isNunSukun ? (nextChar === SUKUN_CHAR ? i + 1 : i) : i);

        if (lookahead) {
          const targetLetter = lookahead.char;

          // Check for Izhar Muthlaq in single word (دُنْيَا, بُنْيَان, قِنْوَان, صِنْوَان)
          const surroundingSlice = safeArabic.slice(Math.max(0, i - 2), Math.min(len, i + 8));
          const isIzharMuthlaqWord = /دُنْيَا|بُنْيَان|قِنْوَان|صِنْوَان/.test(surroundingSlice);

          if (isIzharMuthlaqWord && isNunSukun && (targetLetter === 'ي' || targetLetter === 'و')) {
            tokens.push({
              index: i,
              char: 'ن',
              rule: 'izhar_halqi',
              ruleLabel: 'Izhar Muthlaq',
              description: `Nun mati bertemu huruf ${targetLetter} dalam SATU kata, wajib dibaca jelas dan tegas tanpa dengung.`,
              colorHex: '#059669', // Deep Emerald
              harakatDuration: 1,
              startOffset: i,
              endOffset: lookahead.index,
              matchedPhoneme: 'نْ + ' + targetLetter + ' (Satu Kata)'
            });
            ruleSummary.izhar_halqi++;
            totalBeats += 1;
            continue;
          }

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

          // B. Idgham Bighunnah (bertemu ي, ن, م, و di dua kata terpisah)
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

      // 4. Mim Sukun (مْ) Rules (Strictly Mim with Sukun ْ)
      const isMimSukun = currentChar === 'م' && (nextChar === SUKUN_CHAR || nextChar === '\u06DF');
      if (isMimSukun) {
        const lookahead = getNextNonSpaceChar(i + 1);
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
          }
        }
      }

      // 5. Mad Rules (Panjang Bacaan: Mad Wajib, Mad Jaiz, Mad Lazim)
      if (currentChar === MADDAH_CHAR || nextChar === MADDAH_CHAR) {
        const lookahead = getNextNonSpaceChar(currentChar === MADDAH_CHAR ? i : i + 1);
        const hasShaddahAhead = safeArabic.slice(i, i + 6).includes(SHADDAH_CHAR);
        
        let mRule: TajwidRuleType = 'mad_wajib_muttashil';
        let mLabel = 'Mad Wajib Muttashil';
        let mBeats = 5;
        let mDesc = 'Terdapat tanda bendera mad bertemu hamzah dalam satu kata, dipanjangkan 4-5 harakat.';

        if (hasShaddahAhead) {
          mRule = 'mad_lazim';
          mLabel = 'Mad Lazim Kilmi Mutsaqqal';
          mBeats = 6;
          mDesc = 'Mad bertemu huruf bertasydid dalam satu kata, wajib dipanjangkan 6 harakat sempurna.';
          ruleSummary.mad_lazim++;
        } else if (lookahead && ['ء', 'أ', 'إ', 'ؤ', 'ئ'].includes(lookahead.char)) {
          mRule = 'mad_wajib_muttashil';
          mLabel = 'Mad Wajib Muttashil';
          mBeats = 5;
          mDesc = 'Mad bertemu hamzah dalam satu kata, dipanjangkan 4-5 harakat.';
          ruleSummary.mad_wajib_muttashil++;
        } else {
          mRule = 'mad_jaiz_munfashil';
          mLabel = 'Mad Jaiz Munfashil';
          mBeats = 5;
          mDesc = 'Mad bertemu hamzah di kata berikutnya, boleh dipanjangkan 4-5 harakat.';
          ruleSummary.mad_jaiz_munfashil++;
        }

        tokens.push({
          index: i,
          char: currentChar,
          rule: mRule,
          ruleLabel: mLabel,
          description: mDesc,
          colorHex: '#DC2626',
          harakatDuration: mBeats,
          startOffset: i,
          endOffset: (lookahead ? lookahead.index : i + 2),
          matchedPhoneme: 'ـٓ'
        });
        totalBeats += mBeats;
        continue;
      }

      // 6. Iqlab Small Superscript Mim (ۢ / ۭ)
      if (currentChar === '\u06E2' || currentChar === '\u06ED') {
        const lookahead = getNextNonSpaceChar(i);
        tokens.push({
          index: i,
          char: currentChar,
          rule: 'iqlab',
          ruleLabel: 'Iqlab',
          description: `Terdapat tanda mim iqlab, bunyi 'N' ditukar menjadi 'M' mendengung rapat selama 2 harakat.`,
          colorHex: '#8B5CF6',
          harakatDuration: 2,
          startOffset: Math.max(0, i - 1),
          endOffset: (lookahead ? lookahead.index : i + 1),
          matchedPhoneme: 'ـۢ'
        });
        ruleSummary.iqlab++;
        totalBeats += 2;
        continue;
      }

      // 7. Lam Jalalah (Lafadz Allah Tafkhim & Tarqiq)
      if ((currentChar === 'ٱ' || currentChar === 'ا' || currentChar === 'ل') && safeArabic.slice(i, i + 8).includes('للَّ')) {
        const sub = safeArabic.slice(i, i + 10);
        if (sub.includes('ٱللَّه') || sub.includes('اللَّه') || sub.includes('لِلَّه')) {
          const prevCharSlice = safeArabic.slice(Math.max(0, i - 4), i);
          const isKasrah = prevCharSlice.includes('\u0650') || currentChar === 'ل';
          
          const lRule: TajwidRuleType = isKasrah ? 'lam_jalalah_tarqiq' : 'lam_jalalah_tafkhim';
          const lLabel = isKasrah ? 'Lam Jalalah Tarqiq' : 'Lam Jalalah Tafkhim';
          const lDesc = isKasrah 
            ? 'Lafadz Allah didahului kasrah, dibaca tipis mengalir jernih (Lillah).' 
            : 'Lafadz Allah didahului fathah/dhommah, dibaca tebal bergema (Alloh).';
          const lColor = isKasrah ? '#0284C7' : '#0D9488';

          tokens.push({
            index: i,
            char: currentChar,
            rule: lRule,
            ruleLabel: lLabel,
            description: lDesc,
            colorHex: lColor,
            harakatDuration: 2,
            startOffset: i,
            endOffset: i + 6,
            matchedPhoneme: isKasrah ? 'بِسْمِ ٱللَّهِ' : 'ٱللَّهُ'
          });
          ruleSummary[lRule]++;
          totalBeats += 2;
          i += 4;
          continue;
        }
      }

      // 8. Lam Ta'rif (Idzhar Qamariyah & Idgham Syamsiyah)
      if ((currentChar === 'ٱ' || currentChar === 'ا') && nextChar === 'ل') {
        const afterLam = safeArabic[i + 2] || '';
        const afterLamNext = safeArabic[i + 3] || '';

        if (afterLam === SUKUN_CHAR || afterLam === '\u06DF') {
          const qamLetter = afterLamNext;
          if (QAMARIYAH_LETTERS.includes(qamLetter)) {
            tokens.push({
              index: i,
              char: 'ٱلْ',
              rule: 'idzhar_qamariyah',
              ruleLabel: 'Idzhar Qamariyah',
              description: `Alif Lam bertemu huruf Qamariyah (${qamLetter}), huruf Lam dibaca jelas dan terang.`,
              colorHex: '#059669',
              harakatDuration: 1,
              startOffset: i,
              endOffset: i + 3,
              matchedPhoneme: 'ٱلْـ + ' + qamLetter
            });
            ruleSummary.idzhar_qamariyah++;
            totalBeats += 1;
            i += 2;
            continue;
          }
        } else if (SYAMSIYAH_LETTERS.includes(afterLam) && afterLamNext === SHADDAH_CHAR) {
          tokens.push({
            index: i,
            char: 'ٱل',
            rule: 'idgham_syamsiyah',
            ruleLabel: 'Idgham Syamsiyah',
            description: `Alif Lam melebur ke huruf Syamsiyah (${afterLam}) yang bertasydid.`,
            colorHex: '#EA580C',
            harakatDuration: 1,
            startOffset: i,
            endOffset: i + 3,
            matchedPhoneme: 'ٱلـ + ' + afterLam + 'ّ'
          });
          ruleSummary.idgham_syamsiyah++;
          totalBeats += 1;
          i += 2;
          continue;
        }
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
