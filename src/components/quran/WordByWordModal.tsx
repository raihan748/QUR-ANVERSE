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
import { NeobrutalCard } from '../common/NeobrutalCard';
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
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <NeobrutalCard variant="white" className="p-5 relative border-3 border-black shadow-[8px_8px_0px_0px_#111827] flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-[#F59E0B] font-black">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-display text-black">
                  Kajian Mendalam Kata & Riset Al-Qur'an
                </h3>
                <p className="text-xs text-gray-600 font-semibold">
                  QS. {ayat.surahName} : Ayat {ayat.numberInSurah} (Juz {ayat.juz})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#FEE2E2] hover:bg-[#FCA5A5] border-2 border-black rounded-xl neo-button cursor-pointer"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Full Ayah Preview Banner */}
          <div className="p-3.5 bg-[#FFFDF7] border-2 border-black rounded-2xl mb-3 shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#0B4627] text-[#F59E0B] rounded border border-black font-mono">
                TEKS MUSHAF UTSMANI
              </span>
              <button
                onClick={() => audioPlayer.playAyat(ayat.surahNumber, ayat.numberInSurah)}
                className="flex items-center gap-1 text-xs font-black text-[#0B4627] hover:underline cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Putar Tilawah Syekh
              </button>
            </div>
            <p className="font-quran text-xl sm:text-2xl text-right leading-loose text-emerald-950 my-1" dir="rtl">
              {ayat.arabicText}
            </p>
            <p className="text-xs text-gray-700 italic border-t border-gray-200 pt-1.5 mt-1 font-medium">
              "{ayat.translation}"
            </p>
          </div>

          {/* 6 Research & Exploration Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-3 border-b border-black/20 shrink-0 scrollbar-thin">
            <button
              onClick={() => setActiveTab('words')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'words' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Arti Kata</span>
            </button>

            <button
              onClick={() => setActiveTab('irab')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'irab' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>I'rab & Kaidah Nahwu</span>
            </button>

            <button
              onClick={() => setActiveTab('asmaul')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'asmaul' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Asmaul Husna Terkait</span>
            </button>

            <button
              onClick={() => setActiveTab('hadits')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hadits' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hadits Shahih Pendukung</span>
            </button>

            <button
              onClick={() => setActiveTab('qiraat')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qiraat' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Perbandingan 10 Qira'at</span>
            </button>

            <button
              onClick={() => setActiveTab('concordance')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'concordance' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
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
                      className={`p-3 rounded-2xl border-2 border-black transition-all ${
                        isHighlighted
                          ? 'bg-[#FEF3C7] shadow-[3px_3px_0px_0px_#D97706]'
                          : 'bg-white shadow-[2px_2px_0px_0px_#111827] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 border border-black text-[10px] font-black font-mono flex items-center justify-center text-gray-800">
                          {idx + 1}
                        </span>
                        <p className="font-quran text-2xl text-right font-bold text-emerald-950" dir="rtl">
                          {w.arabic}
                        </p>
                      </div>
                      <div className="mt-2 border-t border-gray-200 pt-1.5">
                        <p className="text-[11px] font-bold text-emerald-800 italic">
                          {w.transliteration}
                        </p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
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
              <div className="p-3 bg-emerald-50 border-2 border-black rounded-2xl">
                <span className="text-xs font-black text-[#0B4627] block mb-1">
                  Struktur Sintaksis Nahwu & Sharaf (Syntactic I'rab Engine)
                </span>
                <p className="text-[11px] text-gray-700 font-semibold">
                  Analisis status i'rab (Marfu', Manshub, Majrur, Majzum) dan fungsi gramatikal setiap kata dalam kalimat suci Al-Qur'an.
                </p>
              </div>

              <div className="space-y-2.5">
                {irabData.words.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#0B4627] text-white text-[10px] font-mono font-black flex items-center justify-center border border-black shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-quran text-xl font-bold text-black" dir="rtl">
                            {w.arabicWord}
                          </span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded border border-black bg-amber-100 text-amber-900 uppercase">
                            {w.partOfSpeech}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border border-black ${
                            w.irabCase === 'MARFU' ? 'bg-blue-100 text-blue-900' :
                            w.irabCase === 'MANSHUB' ? 'bg-rose-100 text-rose-900' :
                            w.irabCase === 'MAJRUR' ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-900'
                          }`}>
                            {w.irabCase}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 mt-1">
                          {w.grammaticalExplanation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-extrabold text-[#0B4627] block bg-emerald-50 px-2 py-1 rounded border border-emerald-300">
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
              <div className="p-3 bg-amber-50 border-2 border-black rounded-2xl">
                <span className="text-xs font-black text-amber-900 block mb-1">
                  Ontologi Asmaul Husna pada Fawashil (Akhir Ayat)
                </span>
                <p className="text-[11px] text-gray-700 font-semibold">
                  Mempelajari hikmah teologis mengapa nama-nama agung Allah dipasangkan pada penutup ayat suci.
                </p>
              </div>

              <div className="space-y-3">
                {asmaulPairs.map((pair) => (
                  <div
                    key={pair.pairKey}
                    className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <div>
                        <span className="text-sm font-black text-gray-900 block">
                          {pair.transliteration}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          Muncul {pair.quranicFrequency}x dalam Al-Qur'an
                        </span>
                      </div>
                      <span className="font-quran text-2xl font-bold text-[#0B4627]" dir="rtl">
                        {pair.arabicText}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-gray-800 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
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
              <div className="p-3 bg-emerald-50 border-2 border-black rounded-2xl">
                <span className="text-xs font-black text-[#0B4627] block mb-1">
                  Korelatif Hadits Shahih Nabawi (Quran-Hadith Cross Graph)
                </span>
                <p className="text-[11px] text-gray-700 font-semibold">
                  Kutubus Sittah (Shahih Bukhari & Muslim) yang menafsirkan arti tekstual atau keutamaan ayat ini.
                </p>
              </div>

              {hadithCorrelations.correlations.length === 0 ? (
                <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-center">
                  <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-600">
                    Tidak ada korelasi hadits langsung yang tercatat untuk ayat ini.
                  </p>
                </div>
              ) : (
                hadithCorrelations.correlations.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <div>
                        <span className="text-xs font-black text-gray-900 block">
                          {c.hadith.bookTitleLatin} (No. {c.hadith.hadithNumber})
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          Perawi: {c.hadith.narratorCompanion}
                        </span>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded border border-black bg-emerald-100 text-emerald-900 font-mono">
                        {c.hadith.authenticityGrade}
                      </span>
                    </div>

                    <p className="font-quran text-lg text-right font-bold text-[#0B4627]" dir="rtl">
                      "{c.hadith.arabicSnippet}"
                    </p>

                    <p className="text-xs text-gray-800 italic">
                      "{c.hadith.indonesianTranslation}"
                    </p>

                    <div className="text-[11px] bg-amber-50 p-2 rounded-xl border border-amber-200 font-semibold text-gray-800">
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
              <div className="p-3 bg-blue-50 border-2 border-black rounded-2xl">
                <span className="text-xs font-black text-blue-900 block mb-1">
                  Varian Riwayat 10 Qira'at Mutawatir
                </span>
                <p className="text-[11px] text-gray-700 font-semibold">
                  Perbedaan pelafalan antara Imam Nafi' (Warsh, Qalun), Imam 'Ashim (Hafs), dan imam lainnya yang bersanad mutawatir ke Rasulullah ﷺ.
                </p>
              </div>

              {qiraatVariants.length === 0 ? (
                <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-center">
                  <Compass className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-600">
                    Pada ayat ini, seluruh 10 Imam Qira'at sepakat pada satu lafal (Ittifaq).
                  </p>
                </div>
              ) : (
                qiraatVariants.map((v: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                      <div>
                        <span className="text-xs font-black text-gray-900 block">
                          Riwayat {v.imamDisplayName}
                        </span>
                        <span className="text-[10px] font-bold text-blue-700">
                          {v.phoneticRule}
                        </span>
                      </div>
                      <span className="font-quran text-2xl font-bold text-black" dir="rtl">
                        {v.arabicLafadz}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 font-medium">
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
              <div className="p-3 bg-teal-50 border-2 border-black rounded-2xl">
                <span className="text-xs font-black text-teal-900 block mb-1">
                  Matriks Konkordansi Bahasa Dunia (Multilingual Concordance)
                </span>
                <p className="text-[11px] text-gray-700 font-semibold">
                  Perbandingan terjemahan resmi otoritatif di 10 bahasa dunia (Indonesia, English, Melayu, Turki, dsb).
                </p>
              </div>

              <div className="space-y-2.5">
                {Object.entries(parallelVerse.translations).map(([langCode, transText]) => {
                  const langMeta = MultilingualConcordanceEngine.LANGUAGES.find((l) => l.code === langCode);
                  return (
                    <div
                      key={langCode}
                      className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-gray-900">
                          {langMeta?.name} ({langMeta?.nativeName})
                        </span>
                        <span className="text-[9px] font-bold text-gray-500">
                          {langMeta?.translatorAuthority}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-800" dir={langMeta?.direction || 'ltr'}>
                        "{transText}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </NeobrutalCard>
      </div>
    </div>
  );
};
