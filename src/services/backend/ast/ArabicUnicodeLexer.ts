// ==============================================================================
// ARABIC UNICODE LEXICAL SCANNER & FINITE STATE MACHINE (FSM)
// Tokenizer for Quranic Rasm Utsmani Codepoint Streams
// ==============================================================================

export type ArabicTokenType = 
  | 'LETTER'
  | 'HARAKAT_FATHAH'
  | 'HARAKAT_KASRAH'
  | 'HARAKAT_DHOMMAH'
  | 'TANWIN_FATHATAIN'
  | 'TANWIN_KASRATAIN'
  | 'TANWIN_DHOMMATAIN'
  | 'SUKUN'
  | 'SHADDAH'
  | 'MADDAH'
  | 'SMALL_MIM_IQLAB'
  | 'GHARIB_SYMBOL'
  | 'WAQF_MARK'
  | 'AYAH_DELIMITER'
  | 'WHITESPACE'
  | 'UNKNOWN';

export const ArabicTokens = {
  LETTER: 'LETTER' as ArabicTokenType,
  HARAKAT_FATHAH: 'HARAKAT_FATHAH' as ArabicTokenType,
  HARAKAT_KASRAH: 'HARAKAT_KASRAH' as ArabicTokenType,
  HARAKAT_DHOMMAH: 'HARAKAT_DHOMMAH' as ArabicTokenType,
  TANWIN_FATHATAIN: 'TANWIN_FATHATAIN' as ArabicTokenType,
  TANWIN_KASRATAIN: 'TANWIN_KASRATAIN' as ArabicTokenType,
  TANWIN_DHOMMATAIN: 'TANWIN_DHOMMATAIN' as ArabicTokenType,
  SUKUN: 'SUKUN' as ArabicTokenType,
  SHADDAH: 'SHADDAH' as ArabicTokenType,
  MADDAH: 'MADDAH' as ArabicTokenType,
  SMALL_MIM_IQLAB: 'SMALL_MIM_IQLAB' as ArabicTokenType,
  GHARIB_SYMBOL: 'GHARIB_SYMBOL' as ArabicTokenType,
  WAQF_MARK: 'WAQF_MARK' as ArabicTokenType,
  AYAH_DELIMITER: 'AYAH_DELIMITER' as ArabicTokenType,
  WHITESPACE: 'WHITESPACE' as ArabicTokenType,
  UNKNOWN: 'UNKNOWN' as ArabicTokenType,
};

export interface LexerToken {
  type: ArabicTokenType;
  value: string;
  charOffset: number;
  length: number;
}

export class ArabicUnicodeLexer {
  public static tokenize(input: string): LexerToken[] {
    const tokens: LexerToken[] = [];
    const len = input.length;
    let i = 0;

    while (i < len) {
      const char = input[i];
      const charCode = char.charCodeAt(0);

      // Whitespace
      if (char === ' ' || char === '\t' || char === '\n') {
        tokens.push({ type: 'WHITESPACE', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Shaddah
      if (char === '\u0651') {
        tokens.push({ type: 'SHADDAH', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Sukun
      if (char === '\u0652' || char === '\u06DF') {
        tokens.push({ type: 'SUKUN', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Maddah
      if (char === '\u0653' || char === '~') {
        tokens.push({ type: 'MADDAH', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Small Mim (Iqlab: U+06E2, U+06ED)
      if (char === '\u06E2' || char === '\u06ED') {
        tokens.push({ type: 'SMALL_MIM_IQLAB', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Tanwin
      if (char === '\u064B') {
        tokens.push({ type: 'TANWIN_FATHATAIN', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }
      if (char === '\u064D') {
        tokens.push({ type: 'TANWIN_KASRATAIN', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }
      if (char === '\u064C') {
        tokens.push({ type: 'TANWIN_DHOMMATAIN', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Harakat
      if (char === '\u064E') {
        tokens.push({ type: 'HARAKAT_FATHAH', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }
      if (char === '\u0650') {
        tokens.push({ type: 'HARAKAT_KASRAH', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }
      if (char === '\u064F') {
        tokens.push({ type: 'HARAKAT_DHOMMAH', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Waqf Marks (ج, قلى, صلى, لا, مـ, ۩)
      if (['ۚ', 'ۗ', 'ۖ', 'ۘ', 'ۙ', 'ۛ', '۩', 'ۜ'].includes(char)) {
        tokens.push({ type: 'WAQF_MARK', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Ayah Delimiter (۝ / numbers)
      if (char === '۝' || (charCode >= 0x0660 && charCode <= 0x0669)) {
        tokens.push({ type: 'AYAH_DELIMITER', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Arabic Letters
      if ((charCode >= 0x0621 && charCode <= 0x064A) || char === 'ٱ' || char === 'ى' || char === 'ة') {
        tokens.push({ type: 'LETTER', value: char, charOffset: i, length: 1 });
        i++;
        continue;
      }

      // Fallback
      tokens.push({ type: 'UNKNOWN', value: char, charOffset: i, length: 1 });
      i++;
    }

    return tokens;
  }
}
