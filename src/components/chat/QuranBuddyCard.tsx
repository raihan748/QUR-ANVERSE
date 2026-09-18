import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Trash2,
  Settings,
  Bot,
  RotateCcw,
  Check,
  ChevronDown
} from 'lucide-react';
import {
  quranBuddyService,
  ChatMessage,
  QuranBuddyConfig
} from '../../services/quranBuddyService';

interface QuranBuddyCardProps {
  className?: string;
}

export const QuranBuddyCard: React.FC<QuranBuddyCardProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true); // Terbuka langsung by default
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Settings form state
  const [configForm, setConfigForm] = useState<QuranBuddyConfig>(
    quranBuddyService.getConfig()
  );
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history and config on mount
  useEffect(() => {
    setMessages(quranBuddyService.loadHistory());
    setConfigForm(quranBuddyService.getConfig());
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && !showSettings) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, showSettings]);

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
      const reply = await quranBuddyService.sendMessage(textToSend, newHistory);
      const assistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now()
      };

      const finalHistory = [...newHistory, assistantMessage];
      setMessages(finalHistory);
      quranBuddyService.saveHistory(finalHistory);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat menghubungi DeepSeek v4 Pro. Silakan periksa kembali API Key dan koneksi internetmu.',
        timestamp: Date.now()
      };
      const finalHistory = [...newHistory, errorMessage];
      setMessages(finalHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat obrolan dengan Quran Buddy?')) {
      const reset = quranBuddyService.clearHistory();
      setMessages(reset);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    quranBuddyService.updateConfig(configForm);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      setShowSettings(false);
    }, 1200);
  };

  const quickPrompts = [
    '💡 Apa keutamaan Surah Al-Ikhlas?',
    '📖 Hukum Idgham Bighunnah & contohnya?',
    '🤲 Tips agar hafalan Qur\'an cepat mutqin?',
    '✨ Adab membaca Al-Qur\'an bagi santri?'
  ];

  // 1. Minimized / Floating Trigger Button (Saat ditutup)
  if (!isOpen) {
    return (
      <div className={`fixed bottom-20 lg:bottom-6 right-3 sm:right-4 z-50 ${className}`}>
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group flex items-center gap-2 px-3.5 py-2.5 bg-[#0B4627] hover:bg-[#07301b] text-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] cursor-pointer transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5"
          title="Buka Quran Buddy (DeepSeek v4 Pro)"
        >
          <div className="relative flex items-center justify-center w-7 h-7 bg-amber-400 text-black rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-black leading-tight text-amber-300">Quran Buddy</span>
            <span className="block text-[9px] text-emerald-200 font-mono">DeepSeek v4</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform ml-1" />
        </button>
      </div>
    );
  }

  // 2. Minimized Header Strip (Collapsed state)
  if (isMinimized) {
    return (
      <div className={`fixed bottom-20 lg:bottom-6 right-4 z-50 ${className}`}>
        <div className="flex items-center justify-between w-[280px] sm:w-[320px] px-3.5 py-2.5 bg-[#0B4627] text-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
          <div
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 cursor-pointer select-none flex-1"
          >
            <Bot className="w-5 h-5 text-amber-400" />
            <span className="font-black text-xs text-amber-300">Quran Buddy</span>
            <span className="px-1.5 py-0.5 bg-emerald-900 border border-emerald-500 text-[9px] font-mono rounded text-emerald-300">
              Online
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-emerald-200 hover:text-white cursor-pointer"
              title="Perbesar"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-emerald-200 hover:text-red-400 cursor-pointer"
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
      className={`fixed bottom-20 lg:bottom-6 right-3 sm:right-4 z-50 w-[320px] sm:w-[350px] md:w-[370px] h-[470px] sm:h-[500px] max-h-[78vh] flex flex-col bg-[#FFFDF7] border-3 border-black rounded-2xl shadow-[5px_5px_0px_0px_#000] overflow-hidden animate-pop ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0B4627] text-white border-b-2 border-black select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 bg-amber-400 text-black rounded-xl border-2 border-black shadow-[1px_1px_0px_0px_#000]">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs text-amber-300">Quran Buddy</h3>
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 text-[9px] font-mono rounded border border-emerald-600">
                v4 Pro
              </span>
            </div>
            <p className="text-[10px] text-emerald-200 leading-none">Sahabat Belajar Al-Qur'an</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border border-black/40 hover:bg-emerald-800 transition-colors ${
              showSettings ? 'bg-amber-400 text-black font-bold' : 'text-emerald-200'
            }`}
            title="Pengaturan API Thirty Store"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-emerald-200 hover:text-red-300 hover:bg-emerald-800 rounded-lg transition-colors"
            title="Reset Percakapan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
            title="Perkecil"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-emerald-200 hover:text-red-400 hover:bg-emerald-800 rounded-lg transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Overlay View */}
      {showSettings ? (
        <div className="flex-1 p-3.5 overflow-y-auto bg-amber-50/50 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <span className="font-black text-gray-900 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-amber-600" /> Konfigurasi DeepSeek v4
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-[11px] text-gray-500 hover:text-black font-bold"
            >
              Kembali ke Chat
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                API Base URL (Thirty Store):
              </label>
              <input
                type="text"
                value={configForm.baseUrl}
                onChange={(e) =>
                  setConfigForm({ ...configForm, baseUrl: e.target.value })
                }
                className="w-full p-2 text-xs border-2 border-black rounded-xl bg-white font-mono"
                placeholder="https://api.thirtystore.com/v1"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                API Key (Bearer Token):
              </label>
              <input
                type="password"
                value={configForm.apiKey}
                onChange={(e) =>
                  setConfigForm({ ...configForm, apiKey: e.target.value })
                }
                className="w-full p-2 text-xs border-2 border-black rounded-xl bg-white font-mono"
                placeholder="sk-ts-..."
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Model Name:
              </label>
              <input
                type="text"
                value={configForm.model}
                onChange={(e) =>
                  setConfigForm({ ...configForm, model: e.target.value })
                }
                className="w-full p-2 text-xs border-2 border-black rounded-xl bg-white font-mono"
                placeholder="thirty/deepseek-v4-pro"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0B4627] hover:bg-emerald-900 text-white font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Pengaturan</span>
              )}
            </button>
          </form>

          <p className="text-[10px] text-gray-500 italic mt-2">
            Kredensial tersimpan secara privat di penyimpanan lokal HP santri (localStorage) dan tidak pernah dikirim ke pihak lain.
          </p>
        </div>
      ) : (
        /* Chat Content Area */
        <>
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#FFFDF7]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`text-xs leading-relaxed max-w-[88%] p-3 rounded-2xl border-2 border-black ${
                      isUser
                        ? 'bg-[#0B4627] text-white rounded-br-sm shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-[2px_2px_0px_0px_#000] space-y-1'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-2xl rounded-bl-sm w-fit shadow-[2px_2px_0px_0px_#000] animate-pulse">
                <Bot className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="text-xs text-gray-600 font-medium">
                  Quran Buddy sedang berpikir...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Strip */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-2.5 py-1.5 bg-amber-50/70 border-t border-amber-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                  className="px-2 py-1 text-[10px] bg-white hover:bg-amber-100 text-gray-800 border border-black rounded-lg whitespace-nowrap cursor-pointer shadow-[1px_1px_0px_0px_#000] shrink-0 font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t-2 border-black">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanya arti, tajwid, atau tips Qur'an..."
                className="flex-1 px-3 py-2 text-xs border-2 border-black rounded-xl bg-gray-50 focus:bg-white focus:outline-none placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] cursor-pointer disabled:cursor-not-allowed transition-transform active:translate-x-0.5 active:translate-y-0.5"
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
