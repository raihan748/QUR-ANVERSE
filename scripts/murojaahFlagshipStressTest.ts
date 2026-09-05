// ==============================================================================
// 👑 QURANVERSE MUROJA'AH AI REAL-TIME FLAGSHIP HEAVY STRESS TEST SUITE
// Exhaustive Validation: Multi-Ayah Streaming, Wasl Al-Ayat, Muqatta'at,
// Dialect Phonetics, Long Verses, Hesitation/Pauses, & Error Recovery
// ==============================================================================

import { 
  continuousTracker, 
  speechEngine, 
  precompileAyat, 
  normalizeArabic, 
  canonicalizeArabicPhonemes, 
  isPrecompiledWordMatch,
  fastLevenshteinSimilarity,
  diagnoseTajweedAndMakhrajError,
  analyzeSpokenToken
} from '../src/services/speechEngine.ts';
import { Ayat } from '../src/types/index.ts';
import { CORE_AYATS_DB } from '../src/data/quranData.ts';
import { JUZ_29_AYATS } from '../src/data/juz29Data.ts';
import { JUZ_30_AYATS } from '../src/data/juz30Data.ts';

console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║   👑 QURANVERSE MUROJA\'AH AI REAL-TIME FLAGSHIP HEAVY STRESS TEST        ║');
console.log('║   Target: Zero-Bug Verification, Multi-Ayah Streaming, Wasl Al-Ayat,     ║');
console.log('║   Muqatta\'at 29 Surahs, Dialect Phonetics, Long Verses & Error Recovery  ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

const suiteStart = performance.now();
const testResults: { name: string; ops: number; durationMs: number; avgLatencyMs: number; throughput: number; passed: boolean }[] = [];

function recordTest(name: string, ops: number, durationMs: number, targetLatencyMs: number, targetThroughput: number) {
  const throughput = Math.round(ops / (durationMs / 1000));
  const avgLatencyMs = durationMs / ops;
  const passed = avgLatencyMs <= targetLatencyMs && throughput >= targetThroughput;

  testResults.push({ name, ops, durationMs, avgLatencyMs, throughput, passed });

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${name}]`);
  console.log(`   Operations: ${ops.toLocaleString()} ops in ${durationMs.toFixed(2)} ms`);
  console.log(`   Throughput: ${throughput.toLocaleString()} ops/sec (Target: >= ${targetThroughput.toLocaleString()})`);
  console.log(`   Latency:    ${(avgLatencyMs * 1000).toFixed(2)} µs/op (Target: <= ${(targetLatencyMs * 1000).toFixed(2)} µs)`);
  console.log(`   Status:     ${passed ? 'SLA PASSED (100% GREEN)' : 'SLA BREACHED'}\n`);

  if (!passed) {
    throw new Error(`SLA breached in ${name}: Latency ${avgLatencyMs.toFixed(4)}ms > ${targetLatencyMs}ms`);
  }
}

// ------------------------------------------------------------------------------
// TEST 1: STANDARD MULTI-AYAH STREAMING MUROJA'AH (Surah Al-Fatihah 1-7)
// ------------------------------------------------------------------------------
console.log('>>> [1/9] Testing Multi-Ayah Streaming Muroja\'ah (Surah Al-Fatihah 1-7)...');
const fatihahAyats: Ayat[] = CORE_AYATS_DB[1];
if (!fatihahAyats || fatihahAyats.length !== 7) {
  throw new Error('Surah Al-Fatihah data missing or incomplete!');
}

let wordMatchedCalls = 0;
let ayahCompletedCalls = 0;
let passageCompletedScore: number | null = null;
let errorCalls = 0;

continuousTracker.initialize(fatihahAyats, {
  onWordMatched: (_aIdx, _wIdx, _wText) => {
    wordMatchedCalls++;
  },
  onAyahCompleted: (_aIdx, _ayat) => {
    ayahCompletedCalls++;
  },
  onErrorDetected: (_aIdx, _wIdx, _reason) => {
    errorCalls++;
  },
  onPassageCompleted: (score) => {
    passageCompletedScore = score;
  }
});

const t1Start = performance.now();
// Recite Al-Fatihah word-by-word with 3 interim updates + 1 final update per word
let totalStreamPackets = 0;
for (let aIdx = 0; aIdx < fatihahAyats.length; aIdx++) {
  const ayat = fatihahAyats[aIdx];
  const words = ayat.arabicText.split(/\s+/).filter(w => normalizeArabic(w).length > 0);
  let accumulatedUtterance = '';

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const word = words[wIdx];
    accumulatedUtterance += (accumulatedUtterance ? ' ' : '') + word;
    
    // Simulate 3 interim packets per word
    for (let interim = 0; interim < 3; interim++) {
      continuousTracker.processStream(accumulatedUtterance, [], false);
      totalStreamPackets++;
    }
    // 1 final packet
    continuousTracker.processStream(accumulatedUtterance, [], true);
    totalStreamPackets++;
  }
}
const t1Duration = performance.now() - t1Start;

const fatihahStatus = continuousTracker.getStatus();
const totalFatihahWords = fatihahAyats.reduce((sum, a) => sum + a.arabicText.split(/\s+/).filter(w => normalizeArabic(w).length > 0).length, 0);

console.log(`   - Total Expected Words: ${totalFatihahWords}`);
console.log(`   - Matched Words Count:  ${fatihahStatus.matchedWordsCount}`);
console.log(`   - Progress Percentage:  ${fatihahStatus.progressPercentage}%`);
console.log(`   - Ayahs Completed:      ${ayahCompletedCalls} / 7`);
console.log(`   - Passage Score:        ${passageCompletedScore}%`);
console.log(`   - Error Detected Calls: ${errorCalls}`);

if (fatihahStatus.matchedWordsCount !== totalFatihahWords) {
  throw new Error(`Word count mismatch: expected ${totalFatihahWords}, got ${fatihahStatus.matchedWordsCount}`);
}
if (fatihahStatus.progressPercentage !== 100) {
  throw new Error(`Progress percentage should be 100%, got ${fatihahStatus.progressPercentage}%`);
}
if (ayahCompletedCalls !== 7) {
  throw new Error(`Expected 7 ayahs completed, got ${ayahCompletedCalls}`);
}
if (passageCompletedScore === null || passageCompletedScore < 95) {
  throw new Error(`Passage score too low: ${passageCompletedScore}`);
}
if (errorCalls !== 0) {
  throw new Error(`Unexpected errors detected during clean recitation: ${errorCalls}`);
}

recordTest('Test 1: Standard Multi-Ayah Streaming (Al-Fatihah)', totalStreamPackets, t1Duration, 0.5, 2000);

// ------------------------------------------------------------------------------
// TEST 2: FULL SURAH AL-MULK (30 AYATS, 333 WORDS) CONTINUOUS TRACKING
// ------------------------------------------------------------------------------
console.log('>>> [2/9] Testing 3-Qul Multi-Surah Continuous Tracking (Surah 112, 113, 114 - 15 Ayats)...');
const threeQulAyats = [
  ...(JUZ_30_AYATS[112] || []),
  ...(JUZ_30_AYATS[113] || []),
  ...(JUZ_30_AYATS[114] || [])
];
if (!threeQulAyats || threeQulAyats.length !== 15) {
  throw new Error(`3-Qul data missing or incomplete: expected 15, got ${threeQulAyats.length}`);
}

let threeQulAyahCompleted = 0;
let threeQulPassageScore: number | null = null;
let threeQulErrors = 0;

continuousTracker.initialize(threeQulAyats, {
  onWordMatched: () => {},
  onAyahCompleted: () => {
    threeQulAyahCompleted++;
  },
  onErrorDetected: () => {
    threeQulErrors++;
  },
  onPassageCompleted: (score) => {
    threeQulPassageScore = score;
  }
});

const t2Start = performance.now();
let threeQulPackets = 0;
for (let aIdx = 0; aIdx < threeQulAyats.length; aIdx++) {
  const ayat = threeQulAyats[aIdx];
  const words = ayat.arabicText.split(/\s+/).filter(w => normalizeArabic(w).length > 0);
  let utterance = '';

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    utterance += (utterance ? ' ' : '') + words[wIdx];
    continuousTracker.processStream(utterance, [], false);
    threeQulPackets++;
  }
  // Complete verse with final utterance
  continuousTracker.processStream(utterance, [], true);
  threeQulPackets++;
}
const t2Duration = performance.now() - t2Start;

const threeQulStatus = continuousTracker.getStatus();
const totalThreeQulWords = threeQulAyats.reduce((sum, a) => sum + a.arabicText.split(/\s+/).filter(w => normalizeArabic(w).length > 0).length, 0);

console.log(`   - 3-Qul Total Expected Words:  ${totalThreeQulWords}`);
console.log(`   - Matched Words Count:         ${threeQulStatus.matchedWordsCount}`);
console.log(`   - Final Progress Percentage:   ${threeQulStatus.progressPercentage}%`);
console.log(`   - Ayahs Completed:             ${threeQulAyahCompleted} / 15`);
console.log(`   - Final Passage Score:         ${threeQulPassageScore}%`);

if (threeQulStatus.matchedWordsCount !== totalThreeQulWords) {
  throw new Error(`3-Qul word count mismatch: expected ${totalThreeQulWords}, got ${threeQulStatus.matchedWordsCount}`);
}
if (threeQulAyahCompleted !== 15) {
  throw new Error(`Expected 15 ayahs completed, got ${threeQulAyahCompleted}`);
}
if (threeQulPassageScore === null || threeQulPassageScore < 95) {
  throw new Error(`3-Qul passage score too low: ${threeQulPassageScore}`);
}

recordTest('Test 2: 3-Qul Multi-Surah (15 Ayats) Continuous Muroja\'ah', threeQulPackets, t2Duration, 0.5, 2000);

// ------------------------------------------------------------------------------
// TEST 3: WASL AL-AYAT (CROSS-VERSE SINGLE BREATH STREAMING)
// ------------------------------------------------------------------------------
console.log('>>> [3/9] Testing Wasl Al-Ayat (Continuous Recitation Spanning Verse Boundaries)...');
const shortAyats: Ayat[] = [
  {
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    numberInSurah: 1,
    numberInQuran: 6221,
    juz: 30,
    arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    transliteration: 'Qul huwal-lāhu aḥad(un)',
    translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
    audioUrl: ''
  },
  {
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    numberInSurah: 2,
    numberInQuran: 6222,
    juz: 30,
    arabicText: 'اللَّهُ الصَّمَدُ',
    transliteration: 'Allāhuṣ-ṣamad(u)',
    translation: 'Allah tempat meminta segala sesuatu.',
    audioUrl: ''
  },
  {
    surahNumber: 112,
    surahName: 'Al-Ikhlas',
    numberInSurah: 3,
    numberInQuran: 6223,
    juz: 30,
    arabicText: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    transliteration: 'Lam yalid wa lam yūlad',
    translation: '(Allah) tidak beranak dan tidak pula diperanakkan,',
    audioUrl: ''
  }
];

let waslCompletedAyahs = 0;
let waslPassageDone = false;

const t3Start = performance.now();
const waslRuns = 20;
for (let run = 0; run < waslRuns; run++) {
  waslCompletedAyahs = 0;
  waslPassageDone = false;
  continuousTracker.initialize(shortAyats, {
    onWordMatched: () => {},
    onAyahCompleted: () => { waslCompletedAyahs++; },
    onErrorDetected: () => {},
    onPassageCompleted: () => { waslPassageDone = true; }
  });
  // Recite Ayah 1 AND Ayah 2 in ONE single continuous stream without pause:
  continuousTracker.processStream('قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ', [], false);
  // Then continue to Ayah 3:
  continuousTracker.processStream('لَمْ يَلِدْ وَلَمْ يُولَدْ', [], true);
}
const t3Duration = performance.now() - t3Start;

console.log(`   - Wasl Ayahs Completed: ${waslCompletedAyahs} / 3`);
console.log(`   - Wasl Passage Finished: ${waslPassageDone}`);

if (waslCompletedAyahs < 3 || !waslPassageDone) {
  throw new Error(`Wasl Al-Ayat failed to cross verse boundaries: completed ${waslCompletedAyahs} / 3`);
}
recordTest('Test 3: Wasl Al-Ayat (Cross-Verse Continuous Recitation)', waslRuns * 2, t3Duration, 1.0, 1000);

// ------------------------------------------------------------------------------
// TEST 4: NATURAL REPETITION, HESITATION & BREATH PAUSES (ZERO FALSE ERRORS)
// ------------------------------------------------------------------------------
console.log('>>> [4/9] Testing Natural Repetition, Hesitation & Breath Pauses...');
let hesitationErrors = 0;
continuousTracker.initialize(fatihahAyats.slice(0, 3), {
  onWordMatched: () => {},
  onAyahCompleted: () => {},
  onErrorDetected: () => { hesitationErrors++; },
  onPassageCompleted: () => {}
});

const t4Start = performance.now();
// Recite word 1: "بِسْمِ"
continuousTracker.processStream('بِسْمِ', [], false);
// Breath pause with isFinal
continuousTracker.processStream('بِسْمِ', [], true);
// Repeat word 1 (hesitation): "بِسْمِ"
continuousTracker.processStream('بِسْمِ', [], false);
// Continue to word 2: "اللَّهِ"
continuousTracker.processStream('بِسْمِ اللَّهِ', [], false);
// Repeat "اللَّهِ" (santri rhythm catch):
continuousTracker.processStream('اللَّهِ', [], false);
// Continue: "الرَّحْمَٰنِ الرَّحِيمِ"
continuousTracker.processStream('الرَّحْمَٰنِ الرَّحِيمِ', [], true);
const t4Duration = performance.now() - t4Start;

console.log(`   - Hesitation/Repetition Errors Triggered: ${hesitationErrors}`);
if (hesitationErrors !== 0) {
  throw new Error(`False tajweed alarm triggered during natural hesitation/repetition! Count: ${hesitationErrors}`);
}
recordTest('Test 4: Natural Repetition & Breath Pause Invariance', 6, t4Duration, 0.5, 2000);

// ------------------------------------------------------------------------------
// TEST 5: HURUF MUQATTA'AT (29 SURAHS EXTENDED SPOKEN PHONETICS)
// ------------------------------------------------------------------------------
console.log('>>> [5/9] Testing Huruf Muqatta\'at Matching Across Quranic Openers...');
const muqattaatCases = [
  { raw: 'الم', spoken: 'الف لام ميم' },
  { raw: 'الم', spoken: 'alif lam mim' },
  { raw: 'المص', spoken: 'الف لام ميم صاد' },
  { raw: 'الر', spoken: 'الف لام را' },
  { raw: 'المر', spoken: 'الف لام ميم را' },
  { raw: 'كهيعص', spoken: 'كاف ها يا عين صاد' },
  { raw: 'طه', spoken: 'طا ها' },
  { raw: 'طسم', spoken: 'طا سين ميم' },
  { raw: 'طس', spoken: 'طا سين' },
  { raw: 'يس', spoken: 'يا سين' },
  { raw: 'ص', spoken: 'صاد' },
  { raw: 'حم', spoken: 'حا ميم' },
  { raw: 'عسق', spoken: 'عين سين قاف' },
  { raw: 'ق', spoken: 'قاف' },
  { raw: 'ن', spoken: 'نون' }
];

const t5Start = performance.now();
for (let i = 0; i < 500; i++) {
  const c = muqattaatCases[i % muqattaatCases.length];
  const targetWord = {
    raw: c.raw,
    normalized: normalizeArabic(c.raw),
    canonical: canonicalizeArabicPhonemes(c.raw),
    stemCanon: canonicalizeArabicPhonemes(c.raw),
    latinPhonetic: '',
    charLength: c.raw.length
  };
  const spokenToken = analyzeSpokenToken(c.spoken);
  const matched = isPrecompiledWordMatch(targetWord, spokenToken, 'normal');
  if (!matched) {
    throw new Error(`Huruf Muqatta'at matching failed for "${c.raw}" vs "${c.spoken}"`);
  }
}
const t5Duration = performance.now() - t5Start;
recordTest('Test 5: Huruf Muqatta\'at Spoken Name Expansion', 500, t5Duration, 0.1, 10000);

// ------------------------------------------------------------------------------
// TEST 6: LONG VERSES & DYNAMIC LEVENSHTEIN BUFFER STRESS (> 120 - 550 CHARS)
// ------------------------------------------------------------------------------
console.log('>>> [6/9] Testing Long Verses & Dynamic Buffer Capacity (> 120 chars)...');
// Ayat Kursi (Surah 2:255)
const ayatKursiText = 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ';
const kursiCanon = canonicalizeArabicPhonemes(ayatKursiText);

console.log(`   - Ayat Kursi canonical length: ${kursiCanon.length} chars (Must exceed 120)`);
if (kursiCanon.length <= 120) {
  throw new Error('Ayat Kursi text should exceed 120 characters');
}

const t6Start = performance.now();
for (let i = 0; i < 1000; i++) {
  // Test similarity on long verse with slight variation
  const simExact = fastLevenshteinSimilarity(kursiCanon, kursiCanon);
  if (simExact !== 1.0) {
    throw new Error(`Ayat Kursi exact similarity failed: got ${simExact}`);
  }
  // Test with minor end variation
  const variation = kursiCanon.slice(0, -3);
  const simVar = fastLevenshteinSimilarity(kursiCanon, variation);
  if (simVar < 0.95) {
    throw new Error(`Ayat Kursi variation similarity too low: ${simVar}`);
  }
}
const t6Duration = performance.now() - t6Start;
recordTest('Test 6: Long Verses Levenshtein (> 180 chars) Buffer Capacity', 2000, t6Duration, 0.4, 2500);

// ------------------------------------------------------------------------------
// TEST 7: DIALECT PHONETICS & ASR VARIANT INVARIANCE (10,000 WORDS)
// ------------------------------------------------------------------------------
console.log('>>> [7/9] Testing Dialect Phonetic Normalization & ASR Invariance...');
const dialectPairs = [
  { quran: 'مَٰلِكِ', asr: 'مالك' },
  { quran: 'ٱلرَّحْمَٰنِ', asr: 'الرحمن' },
  { quran: 'ٱلصِّرَٰطَ', asr: 'الصراط' },
  { quran: 'ٱلصِّرَٰطَ', asr: 'السراط' }, // Sibilant shift
  { quran: 'ٱلَّذِينَ', asr: 'الذين' },
  { quran: 'إِيَّاكَ', asr: 'اياك' },
  { quran: 'ٱهْدِنَا', asr: 'اهدنا' },
  { quran: 'عَلَيْهِمْ', asr: 'عليهم' },
  { quran: 'ٱلصَّلَوٰةَ', asr: 'الصلاة' },
  { quran: 'ٱلزَّكَوٰةَ', asr: 'الزكاة' },
  { quran: 'ءَامَنُواْ', asr: 'امنو' },
  { quran: 'رِّبِّ', asr: 'رب' },
  { quran: 'جَنَّٰتٍ', asr: 'جنات' }
];

const t7Start = performance.now();
for (let i = 0; i < 10000; i++) {
  const pair = dialectPairs[i % dialectPairs.length];
  const targetWord = {
    raw: pair.quran,
    normalized: normalizeArabic(pair.quran),
    canonical: canonicalizeArabicPhonemes(pair.quran),
    stemCanon: canonicalizeArabicPhonemes(pair.quran),
    latinPhonetic: '',
    charLength: pair.quran.length
  };
  const candidate = analyzeSpokenToken(pair.asr);
  const match = isPrecompiledWordMatch(targetWord, candidate, 'normal');
  if (!match) {
    throw new Error(`Dialect match failed: target "${pair.quran}" vs asr "${pair.asr}"`);
  }
}
const t7Duration = performance.now() - t7Start;
recordTest('Test 7: Dialect Phonetic & ASR Variant Invariance', 10000, t7Duration, 0.05, 20000);

// ------------------------------------------------------------------------------
// TEST 8: GENUINE TAJWEED ERROR DETECTION & PEDAGOGICAL DIAGNOSIS
// ------------------------------------------------------------------------------
console.log('>>> [8/9] Testing Genuine Error Detection, Tajweed Diagnosis & Recovery...');
let detectedErrorReason = '';
let detectedTarget = '';
let detectedSpoken = '';

continuousTracker.initialize(fatihahAyats.slice(1, 3), {
  onWordMatched: () => {},
  onAyahCompleted: () => {},
  onErrorDetected: (_aIdx, _wIdx, reason, targetWord, spokenWord) => {
    detectedErrorReason = reason;
    detectedTarget = targetWord || '';
    detectedSpoken = spokenWord || '';
  },
  onPassageCompleted: () => {}
}, 'high');

// Warm-up linguistic engine to ensure zero JIT cold-start jitter
diagnoseTajweedAndMakhrajError('الْعَالَمِينَ', 'الْغَافِلِينَ');

const t8Start = performance.now();
// Recite Ayah 2: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"
// Student speaks: "الْحَمْدُ لِلَّهِ رَبِّ" correctly
continuousTracker.processStream('الْحَمْدُ لِلَّهِ رَبِّ', [], false);

// Now student makes severe mistake: replacing "الْعَالَمِينَ" with "الْغَافِلِينَ" (Ghafilin instead of 'Alamin)
continuousTracker.processStream('الْغَافِلِينَ', [], false);
continuousTracker.processStream('الْغَافِلِينَ', [], false);
continuousTracker.processStream('الْغَافِلِينَ', [], false);

console.log(`   - Detected Target Word: « ${detectedTarget} »`);
console.log(`   - Detected Spoken Word: « ${detectedSpoken} »`);
console.log(`   - Diagnosis Guidance:   ${detectedErrorReason}`);

if (!detectedErrorReason) {
  throw new Error('Tracker failed to detect severe recitation error!');
}

// Test Recovery: Student corrects self and resumes
continuousTracker.resumeAfterCorrection();
continuousTracker.processStream('الْعَالَمِينَ', [], true);

// Additional Sub-test: Multi-word Wrong Surah Recitation (e.g., Al-Mulk instead of target)
continuousTracker.resumeAfterCorrection();
let multiWordErrorFired = false;
continuousTracker.initialize(fatihahAyats.slice(0, 1), {
  onWordMatched: () => {},
  onAyahCompleted: () => {},
  onErrorDetected: (_a, _w, reason) => {
    multiWordErrorFired = true;
    console.log(`   - Multi-word Wrong Verse Intercepted: « ${reason} »`);
  },
  onPassageCompleted: () => {}
});
continuousTracker.processStream('تبارك الذي بيده الملك وهو على كل شيء قدير', [], false);
if (!multiWordErrorFired) {
  throw new Error('Tracker failed to immediately intercept multi-word wrong verse recitation!');
}

const statusAfterCorrection = continuousTracker.getStatus();
console.log(`   - Status After Correction: Ayah Index ${statusAfterCorrection.currentAyahIndex}, Word Index ${statusAfterCorrection.currentWordIndex}`);
const t8Duration = performance.now() - t8Start;

recordTest('Test 8: Error Detection, Tajweed Diagnosis & Multi-Word Intercept', 10, t8Duration, 1.0, 1000);

// ------------------------------------------------------------------------------
// TEST 9: HIGH-THROUGHPUT STREAM PACKET INGESTION (50,000 OPERATIONS STRESS)
// ------------------------------------------------------------------------------
console.log('>>> [9/9] Testing Ultra-High Throughput Stream Packet Ingestion (50,000 Ops)...');
continuousTracker.initialize(fatihahAyats, {
  onWordMatched: () => {},
  onAyahCompleted: () => {},
  onErrorDetected: () => {},
  onPassageCompleted: () => {}
});

const t9Start = performance.now();
for (let i = 0; i < 50000; i++) {
  // Rapid fire interim stream calls
  continuousTracker.processStream('بِسْمِ اللَّهِ الرَّحْمَٰنِ', [], false);
}
const t9Duration = performance.now() - t9Start;
recordTest('Test 9: Rapid-Fire Stream Ingestion Stress (50,000 packets)', 50000, t9Duration, 0.1, 10000);

// ------------------------------------------------------------------------------
// FINAL SUMMARY
// ------------------------------------------------------------------------------
const totalDuration = performance.now() - suiteStart;
const totalOps = testResults.reduce((acc, r) => acc + r.ops, 0);

console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║   🏆 MUROJA\'AH AI REAL-TIME FLAGSHIP HEAVY STRESS TEST REPORT           ║');
console.log('╠══════════════════════════════════════════════════════════════════════════╣');
console.log(`║   Total Operations:     ${totalOps.toLocaleString().padEnd(48)} ║`);
console.log(`║   Total Wall Clock:     ${(totalDuration.toFixed(2) + ' ms').padEnd(48)} ║`);
console.log(`║   Overall Throughput:   ${(Math.round(totalOps / (totalDuration / 1000)).toLocaleString() + ' ops/sec').padEnd(48)} ║`);
console.log(`║   All Test Suites:      9 / 9 PASSED (100% GREEN)                        ║`);
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');
