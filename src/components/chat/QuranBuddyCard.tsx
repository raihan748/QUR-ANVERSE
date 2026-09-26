import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Trash2,
  Bot,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Compass,
  Brain
} from 'lucide-react';
import {
  quranBuddyService,
  ChatMessage
} from '../../services/quranBuddyService';
import { bayanToolsService, ChatAction } from '../../services/bayanToolsService';

interface QuranBuddyCardProps {
  className?: string;
}

export const QuranBuddyCard: React.FC<QuranBuddyCardProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount + listen to global open and auto-minimize events
  useEffect(() => {
    setMessages(quranBuddyService.loadHistory());

    const handleGlobalOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    const handleAutoMinimize = () => {
      setIsMinimized(true);
    };

    window.addEventListener('qv_open_bayan_buddy', handleGlobalOpen);
    window.addEventListener('qv_open_azman_buddy', handleGlobalOpen);
    window.addEventListener('qv_open_quran_buddy', handleGlobalOpen);
    window.addEventListener('qv_bayan_auto_minimize', handleAutoMinimize);

    return () => {
      window.removeEventListener('qv_open_bayan_buddy', handleGlobalOpen);
      window.removeEventListener('qv_open_azman_buddy', handleGlobalOpen);
      window.removeEventListener('qv_open_quran_buddy', handleGlobalOpen);
      window.removeEventListener('qv_bayan_auto_minimize', handleAutoMinimize);
    };
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading, expandedThinking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const toggleThinking = (msgId: string) => {
    setExpandedThinking((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await quranBuddyService.sendMessage(textToSend, newHistory);
      const assistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        thinking: response.thinking,
        clarification: response.clarification,
        actions: response.actions
      };

      // Auto expand thinking jika ada klarifikasi ambigu
      if (response.thinking) {
        setExpandedThinking((prev) => ({ ...prev, [assistantMessage.id]: true }));
      }

      const finalHistory = [...newHistory, assistantMessage];
      setMessages(finalHistory);
      quranBuddyService.saveHistory(finalHistory);
    } catch (err: any) {
      console.error('[QuranBuddyCard] Error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `Maaf, ada kendala saat menghubungi Server AI Bayan. Coba kirim ulang ya Sahabat Qur'an.`,
        timestamp: Date.now()
      };
      const finalHistory = [...newHistory, errorMessage];
      setMessages(finalHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (action: ChatAction) => {
    bayanToolsService.executeAction(action);
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat obrolan dengan Bayan?')) {
      const reset = quranBuddyService.clearHistory();
      setMessages(reset);
    }
  };

  const quickPrompts = [
    'Buka Al-Mulk',
    'Panduan Muroja\'ah AI',
    'Jadwal sholat hari ini?',
    'Buka Dzikir Petang',
    'Tips hafalan mutqin'
  ];

  // 1. Minimized / Floating Trigger Button (Saat ditutup)
  if (!isOpen) {
    return (
      <div className={`fixed bottom-20 lg:bottom-6 right-3 sm:right-4 z-[9999] ${className}`}>
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group flex items-center gap-2 px-3.5 py-2.5 bg-[#0B4627] hover:bg-[#07301b] text-white border border-emerald-700/60 rounded-2xl shadow-lg cursor-pointer transition-all duration-200 ring-1 ring-emerald-500/20 active:scale-95"
          title="Tanya Bayan (AI Sahabat & Pemandu Al-Qur'an)"
        >
          <div className="relative flex items-center justify-center w-7 h-7 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-emerald-900 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-emerald-900 rounded-full" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight text-amber-300">Tanya Bayan</span>
            <span className="block text-[9px] text-emerald-200 font-medium">Pemandu Al-Huda</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform ml-1" />
        </button>
      </div>
    );
  }

  // 2. Minimized Header Strip (Collapsed state)
  if (isMinimized) {
    return (
      <div className={`fixed bottom-20 lg:bottom-6 right-4 z-[9999] ${className}`}>
        <div className="flex items-center justify-between w-[280px] sm:w-[320px] px-3.5 py-2.5 bg-[#0B4627] text-white border border-emerald-700/60 rounded-2xl shadow-lg ring-1 ring-emerald-500/20">
          <div
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 cursor-pointer select-none flex-1"
          >
            <Bot className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-xs text-amber-300">Tanya Bayan</span>
            <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-600/60 text-[9px] font-mono rounded text-emerald-300">
              Online
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-emerald-200 hover:text-white cursor-pointer rounded-lg hover:bg-emerald-800 transition-colors"
              title="Perbesar"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-emerald-200 hover:text-rose-300 cursor-pointer rounded-lg hover:bg-emerald-800 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fully Expanded Compact Card
  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 right-3 sm:right-4 z-[9999] w-[320px] sm:w-[370px] md:w-[400px] h-[500px] sm:h-[530px] max-h-[82vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5 dark:ring-white/10 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0B4627] text-white border-b border-emerald-800/80 select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-emerald-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-amber-300">Tanya Bayan</h3>
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 text-[9px] font-mono rounded border border-emerald-600/60 flex items-center gap-1">
                <Compass className="w-2.5 h-2.5" /> AI Guide
              </span>
            </div>
            <p className="text-[10px] text-emerald-200 leading-none">Pemandu Cerdas & Sahabat Qur'an</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-emerald-200 hover:text-rose-300 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            title="Reset Percakapan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            title="Perkecil"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-emerald-200 hover:text-rose-300 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isThoughtExpanded = !!expandedThinking[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`text-xs leading-relaxed max-w-[90%] p-3 rounded-2xl border ${
                  isUser
                    ? 'bg-[#0B4627] text-white rounded-br-xs border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-xs border-slate-200 dark:border-slate-800 shadow-xs space-y-1'
                }`}
              >
                {/* 1. Collapsible Chain of Thought (CoT) */}
                {!isUser && msg.thinking && (
                  <div className="mb-2 p-2 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-400/30 rounded-xl text-[11px] select-none">
                    <button
                      onClick={() => toggleThinking(msg.id)}
                      className="w-full flex items-center justify-between font-semibold text-amber-800 dark:text-amber-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Alur Pikir Bayan (Chain of Thought)</span>
                      </span>
                      {isThoughtExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isThoughtExpanded && (
                      <div className="mt-2 pt-2 border-t border-amber-300/30 text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans font-normal">
                        {msg.thinking}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Main Text Content */}
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* 3. Interactive Grill-Me Disambiguation Cards */}
                {!isUser && msg.clarification && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{msg.clarification.question}</span>
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.clarification.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleExecuteAction(opt.action)}
                          className="w-full text-left p-2.5 bg-gradient-to-r from-emerald-50 to-amber-50/40 dark:from-emerald-950/50 dark:to-slate-900 hover:from-emerald-100 hover:to-amber-100/60 dark:hover:from-emerald-900/60 text-slate-900 dark:text-slate-100 border border-emerald-300/80 dark:border-emerald-700/60 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-xs group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0B4627] dark:text-amber-300 group-hover:underline">
                              {opt.label}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {opt.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Interactive Action Badges */}
                {!isUser && msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {msg.actions.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => handleExecuteAction(act)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 rounded-lg transition-all active:scale-95 cursor-pointer shadow-2xs group"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          );
        })}

        {/* Typing Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs w-fit">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Bayan sedang menganalisis</span>
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 bg-amber-50/50 dark:bg-amber-950/20 border-t border-b border-slate-200/80 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] font-medium whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tanya Bayan atau ketik nama surah..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 dark:text-white placeholder:text-slate-400 font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
          title="Kirim pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
