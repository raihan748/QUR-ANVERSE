import React, { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Volume2, 
  Layers, 
  Sparkles, 
  FileText, 
  Bookmark, 
  Compass, 
  Globe2, 
  GraduationCap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Ayat, WordData } from '../../types';
import { audioPlayer } from '../../services/audioPlayerService';
import { SyntacticIrabEngine } from '../../services/backend/research/SyntacticIrabEngine';
import { AsmaulHusnaOntologyEngine } from '../../services/backend/research/AsmaulHusnaOntologyEngine';
import { QuranHadithCrossGraph } from '../../services/backend/research/QuranHadithCrossGraph';
import { QiraatComparativeEngine } from '../../services/backend/qiraat/QiraatComparativeEngine';
import { MultilingualConcordanceEngine } from '../../services/backend/research/MultilingualConcordanceEngine';

interface WordByWordModalProps {
  ayat: Ayat | null;
  isOpen: boolean;
  onClose: () => void;
  selectedWord?: WordData | null;
}

type ModalTab = 'words' | 'irab' | 'asmaul' | 'hadits' | 'qiraat' | 'concordance';

export const WordByWordModal: React.FC<WordByWordModalProps> = ({
  ayat,
  isOpen,
  onClose,
  selectedWord
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('words');

  const words = useMemo(() => {
    if (!ayat) return [];
    return (ayat.words && ayat.words.length > 0)
      ? ayat.words
      : ayat.arabicText.split(/\s+/).filter(Boolean).map((w, idx) => ({
          id: idx + 1,
          arabic: w,
          transliteration: `Lafal ke-${idx + 1}`,
          meaningId: `Potongan kata ke-${idx + 1}`
        }));
  }, [ayat]);

  // Research Data
  const irabData = useMemo(() => {
    return SyntacticIrabEngine.analyzeAyah(
      ayat?.surahNumber || 1,
      ayat?.numberInSurah || 1,
      ayat?.arabicText || ''
    );
  }, [ayat]);

  const hadithCorrelations = useMemo(() => {
    return QuranHadithCrossGraph.getCorrelationsForAyah(
      ayat?.surahNumber || 1,
      ayat?.numberInSurah || 1
    );
  }, [ayat]);

  const qiraatVariants = useMemo(() => {
    return QiraatComparativeEngine.getVariantsForAyah(
      ayat?.surahNumber || 1,
      ayat?.numberInSurah || 1
    );
  }, [ayat]);

  const asmaulPairs = useMemo(() => {
    const allPairs = AsmaulHusnaOntologyEngine.getPairedAttributes();
    if (!ayat) return allPairs.slice(0, 2);
    const matched = allPairs.filter((p) =>
      p.representativeAyat.some(
        (a) => a.surahNumber === ayat.surahNumber && a.ayahNumber === ayat.numberInSurah
      )
    );
    return matched.length > 0 ? matched : allPairs.slice(0, 2);
  }, [ayat]);

  const parallelVerse = useMemo(() => {
    return MultilingualConcordanceEngine.getParallelVerse(
      ayat?.surahNumber || 1,
      ayat?.numberInSurah || 1
    );
  }, [ayat]);

  if (!isOpen || !ayat) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/80 dark:border-emerald-700/60 flex items-center justify-center text-[#0B4627] dark:text-emerald-400 font-bold shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
                  Kajian Mendalam Kata & Riset Al-Qur'an
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  QS. {ayat.surahName} : Ayat {ayat.numberInSurah} (Juz {ayat.juz})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition duration-150 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Ayah Preview Banner */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 rounded-2xl mb-3 shrink-0 shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 bg-emerald-700 text-white rounded-full font-mono">
                Teks Mushaf Utsmani
              </span>
              <button
                onClick={() => audioPlayer.playAyat(ayat.surahNumber, ayat.numberInSurah)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4627] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Putar Tilawah Syekh
              </button>
            </div>
            <p className="font-quran text-xl sm:text-2xl text-right leading-loose text-emerald-950 dark:text-emerald-100 my-1 font-bold" dir="rtl">
              {ayat.arabicText}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic border-t border-emerald-200/50 dark:border-emerald-800/40 pt-1.5 mt-1 font-medium">
              "{ayat.translation}"
            </p>
          </div>

          {/* 6 Research & Exploration Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-200 dark:border-slate-800 shrink-0 scrollbar-thin">
            <button
              onClick={() => setActiveTab('words')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'words' 
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Arti Kata</span>
            </button>

            <button
              onClick={() => setActiveTab('irab')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'irab' 
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>I'rab & Kaidah Nahwu</span>
            </button>

            <button
              onClick={() => setActiveTab('asmaul')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'asmaul' 
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Asmaul Husna Terkait</span>
            </button>

            <button
              onClick={() => setActiveTab('hadits')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hadits' 
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hadits Shahih Pendukung</span>
            </button>

            <button
              onClick={() => setActiveTab('qiraat')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qiraat' 
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Perbandingan 10 Qira'at</span>
            </button>

            <button
              onClick={() => setActiveTab('concordance')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'concordance' 
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Kamus Makna Multibahasa</span>
            </button>
          </div>

          {/* TAB 1: ARTI KATA PER KATA */}
          {activeTab === 'words' && (
            <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {words.map((w, idx) => {
                  const isHighlighted = selectedWord?.id === w.id;
                  return (
                    <div
                      key={w.id || idx}
                      className={`p-3.5 rounded-2xl border transition-all duration-150 ${
                        isHighlighted
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400/80 shadow-xs'
                          : 'bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold font-mono flex items-center justify-center text-slate-600 dark:text-slate-400">
                          {idx + 1}
                        </span>
                        <p className="font-quran text-2xl text-right font-bold text-emerald-950 dark:text-emerald-100" dir="rtl">
                          {w.arabic}
                        </p>
                      </div>
                      <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 italic">
                          {w.transliteration}
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {w.meaningId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: I'RAB & NAHWU SYNTACTIC TREEBANK */}
          {activeTab === 'irab' && (
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl">
                <span className="text-xs font-bold text-[#0B4627] dark:text-emerald-400 block mb-1">
                  Struktur Sintaksis Nahwu & Sharaf (Syntactic I'rab Engine)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Analisis status i'rab (Marfu', Manshub, Majrur, Majzum) dan fungsi gramatikal setiap kata dalam kalimat suci Al-Qur'an.
                </p>
              </div>

              <div className="space-y-2.5">
                {irabData.words.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#0B4627] text-white text-[10px] font-mono font-semibold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-quran text-xl font-bold text-slate-900 dark:text-white" dir="rtl">
                            {w.arabicWord}
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/60 uppercase">
                            {w.partOfSpeech}
                          </span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                            w.irabCase === 'MARFU' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300/60' :
                            w.irabCase === 'MANSHUB' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300/60' :
                            w.irabCase === 'MAJRUR' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60' : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {w.irabCase}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                          {w.grammaticalExplanation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-semibold text-[#0B4627] dark:text-emerald-400 block bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Tanda: {w.caseMarker}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ASMAUL HUSNA ONTOLOGY */}
          {activeTab === 'asmaul' && (
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                  Ontologi Asmaul Husna pada Fawashil (Akhir Ayat)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Mempelajari hikmah teologis mengapa nama-nama agung Allah dipasangkan pada penutup ayat suci.
                </p>
              </div>

              <div className="space-y-3">
                {asmaulPairs.map((pair) => (
                  <div
                    key={pair.pairKey}
                    className="p-4 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">
                          {pair.transliteration}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          Muncul {pair.quranicFrequency}x dalam Al-Qur'an
                        </span>
                      </div>
                      <span className="font-quran text-2xl font-bold text-[#0B4627] dark:text-emerald-400" dir="rtl">
                        {pair.arabicText}
                      </span>
                    </div>

                    <p className="text-xs font-normal text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                      <strong>Hikmah Teologis:</strong> {pair.theologicalContext}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HADITS SHAHIH INTER-TEXTUAL GRAPH */}
          {activeTab === 'hadits' && (
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl">
                <span className="text-xs font-bold text-[#0B4627] dark:text-emerald-400 block mb-1">
                  Korelatif Hadits Shahih Nabawi (Quran-Hadith Cross Graph)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Kutubus Sittah (Shahih Bukhari & Muslim) yang menafsirkan arti tekstual atau keutamaan ayat ini.
                </p>
              </div>

              {hadithCorrelations.correlations.length === 0 ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center">
                  <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">
                    Tidak ada korelasi hadits langsung yang tercatat untuk ayat ini.
                  </p>
                </div>
              ) : (
                hadithCorrelations.correlations.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {c.hadith.bookTitleLatin} (No. {c.hadith.hadithNumber})
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          Perawi: {c.hadith.narratorCompanion}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 font-mono">
                        {c.hadith.authenticityGrade}
                      </span>
                    </div>

                    <p className="font-quran text-lg text-right font-bold text-[#0B4627] dark:text-emerald-400" dir="rtl">
                      "{c.hadith.arabicSnippet}"
                    </p>

                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                      "{c.hadith.indonesianTranslation}"
                    </p>

                    <div className="text-[11px] bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40 font-medium text-slate-800 dark:text-slate-200">
                      <strong>Keterkaitan Tafsir:</strong> {c.commentary}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: 10 QIRA'AT MUTAWATIR */}
          {activeTab === 'qiraat' && (
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">
                  Varian Riwayat 10 Qira'at Mutawatir
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Perbedaan pelafalan antara Imam Nafi' (Warsh, Qalun), Imam 'Ashim (Hafs), dan imam lainnya yang bersanad mutawatir ke Rasulullah ﷺ.
                </p>
              </div>

              {qiraatVariants.length === 0 ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center">
                  <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">
                    Pada ayat ini, seluruh 10 Imam Qira'at sepakat pada satu lafal (Ittifaq).
                  </p>
                </div>
              ) : (
                qiraatVariants.map((v: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Riwayat {v.imamDisplayName}
                        </span>
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                          {v.phoneticRule}
                        </span>
                      </div>
                      <span className="font-quran text-2xl font-bold text-slate-900 dark:text-white" dir="rtl">
                        {v.arabicLafadz}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <strong>Nuansa Makna:</strong> {v.tafsirNuance}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: MULTILINGUAL CONCORDANCE */}
          {activeTab === 'concordance' && (
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              <div className="p-3 bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-300 block mb-1">
                  Matriks Konkordansi Bahasa Dunia (Multilingual Concordance)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Perbandingan terjemahan resmi otoritatif di 10 bahasa dunia (Indonesia, English, Melayu, Turki, dsb).
                </p>
              </div>

              <div className="space-y-2.5">
                {Object.entries(parallelVerse.translations).map(([langCode, transText]) => {
                  const langMeta = MultilingualConcordanceEngine.LANGUAGES.find((l) => l.code === langCode);
                  return (
                    <div
                      key={langCode}
                      className="p-3.5 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {langMeta?.name} ({langMeta?.nativeName})
                        </span>
                        <span className="text-[9px] font-medium text-slate-500">
                          {langMeta?.translatorAuthority}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed" dir={langMeta?.direction || 'ltr'}>
                        "{transText}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
