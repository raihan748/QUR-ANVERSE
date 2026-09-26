// ==============================================================================
// AGENTIC EXECUTION HUD (AUTONOMOUS JARVIS SEQUENCE)
// Sinematik Live-Stepper Aksi Cerdas Bayan AI untuk Platform Al-Huda
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle2, Loader2, Sparkles, X, Compass, ChevronRight } from 'lucide-react';

export interface AgenticHUDPayload {
  title: string;
  subtitle?: string;
  steps: string[];
  targetTab?: string;
  surahNumber?: number;
  ayahNumber?: number;
  durationMs?: number;
}

export const AgenticExecutionHUD: React.FC = () => {
  const [activePayload, setActivePayload] = useState<AgenticHUDPayload | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const handleTriggerHUD = (e: Event) => {
      const customEvent = e as CustomEvent<AgenticHUDPayload>;
      if (!customEvent.detail) return;

      const payload = customEvent.detail;
      setActivePayload(payload);
      setCurrentStepIndex(0);
      setIsCompleted(false);

      // Sinyal untuk otomatis minimize chat card agar layar fokus ke aksi
      window.dispatchEvent(new CustomEvent('qv_bayan_auto_minimize'));

      const stepsCount = payload.steps.length;
      const stepDuration = Math.max(500, Math.floor((payload.durationMs || 2400) / stepsCount));

      // Jalankan stepper langkah demi langkah secara visual
      payload.steps.forEach((_, idx) => {
        setTimeout(() => {
          setCurrentStepIndex(idx);
          if (idx === stepsCount - 1) {
            setTimeout(() => {
              setIsCompleted(true);
            }, stepDuration);
          }
        }, idx * stepDuration);
      });

      // Auto dismiss HUD setelah selesai
      const totalDuration = (payload.durationMs || 2400) + 1200;
      const dismissTimer = setTimeout(() => {
        setActivePayload(null);
      }, totalDuration);

      return () => clearTimeout(dismissTimer);
    };

    window.addEventListener('qv_bayan_agentic_hud', handleTriggerHUD);
    return () => window.removeEventListener('qv_bayan_agentic_hud', handleTriggerHUD);
  }, []);

  if (!activePayload) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000] w-[92%] sm:w-[460px] animate-in fade-in slide-in-from-top-6 duration-300 pointer-events-auto">
      <div className="bg-[#06331D]/95 backdrop-blur-xl border border-amber-400/40 rounded-2xl p-4 shadow-2xl ring-2 ring-emerald-500/20 text-white select-none relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-7 h-7 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs">
              <Bot className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-emerald-950 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-emerald-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 animate-spin [animation-duration:6s]" /> BAYAN AUTONOMOUS AGENT
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-600/60 text-emerald-300 text-[9px] rounded font-mono">
                  {isCompleted ? 'EXECUTED' : 'RUNNING'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100">{activePayload.title}</h4>
            </div>
          </div>

          <button
            onClick={() => setActivePayload(null)}
            className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer"
            title="Tutup HUD"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Stepper Sequence */}
        <div className="space-y-2 mb-3">
          {activePayload.steps.map((step, idx) => {
            const isDone = idx < currentStepIndex || isCompleted;
            const isCurrent = idx === currentStepIndex && !isCompleted;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400/60 text-amber-200 font-semibold shadow-xs'
                    : isDone
                    ? 'bg-emerald-950/60 border-emerald-700/40 text-emerald-300 font-medium'
                    : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-emerald-700/40 flex items-center justify-center text-[9px] text-emerald-400 font-mono shrink-0">
                      {idx + 1}
                    </div>
                  )}
                  <span>{step}</span>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-mono text-amber-300 flex items-center gap-0.5 animate-pulse">
                    Proses <ChevronRight className="w-3 h-3" />
                  </span>
                )}
                {isDone && (
                  <span className="text-[10px] font-mono text-emerald-400">OK</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar & Footer */}
        <div className="relative w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-300 transition-all duration-300"
            style={{
              width: isCompleted
                ? '100%'
                : `${Math.round(((currentStepIndex + 1) / activePayload.steps.length) * 100)}%`
            }}
          />
        </div>

        {isCompleted && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] font-semibold text-amber-300 animate-in fade-in duration-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Berhasil Dibuka & Difokuskan</span>
          </div>
        )}
      </div>
    </div>
  );
};
