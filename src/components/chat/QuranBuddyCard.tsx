import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Trash2,
  Bot,
  ChevronDown
} from 'lucide-react';
import {
  quranBuddyService,
  ChatMessage
} from '../../services/quranBuddyService';

interface QuranBuddyCardProps {
  className?: string;
}

export const QuranBuddyCard: React.FC<QuranBuddyCardProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // Mulai dalam keadaan minimized agar tidak menutupi ayat mushaf
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount + listen to global open event
  useEffect(() => {
    setMessages(quranBuddyService.loadHistory());

    const handleGlobalOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('qv_open_quran_buddy', handleGlobalOpen);
    return () => window.removeEventListener('qv_open_quran_buddy', handleGlobalOpen);
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

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
      console.error('[QuranBuddyCard] Error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Maaf, ada kendala: ${err?.message || 'Gagal tersambung ke DeepSeek'}. Coba kirim ulang ya Sahabat Qur'an.`,
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

  const quickPrompts = [
    '💡 Apa keutamaan Surah Al-Ikhlas?',
    '📖 Hukum Idgham Bighunnah & contohnya?',
    '🤲 Tips agar hafalan Qur\'an cepat mutqin?',
    '✨ Adab membaca Al-Qur\'an bagi santri?'
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
            <span className="block text-[9px] text-emerald-200 font-medium">Sahabat Qur'an</span>
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

  // 3. Fully Expanded Compact Card (Tanpa Menu Setting, Langsung Siap Pakai)
  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 right-3 sm:right-4 z-[9999] w-[320px] sm:w-[350px] md:w-[370px] h-[470px] sm:h-[500px] max-h-[78vh] flex flex-col bg-[#FFFDF7] border-3 border-black rounded-2xl shadow-[5px_5px_0px_0px_#000] overflow-hidden animate-pop ${className}`}
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
                DeepSeek v4 Pro
              </span>
            </div>
            <p className="text-[10px] text-emerald-200 leading-none">Sahabat Belajar Al-Qur'an</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-emerald-200 hover:text-red-300 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
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
            className="p-1.5 text-emerald-200 hover:text-red-400 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
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

        {/* Typing Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white text-gray-800 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] w-fit">
            <span className="text-xs font-bold text-[#0B4627]">Quran Buddy sedang berpikir</span>
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-[#0B4627] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#0B4627] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#0B4627] rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions (Tampil jika riwayat masih sedikit) */}
      {messages.length <= 2 && (
        <div className="px-3 py-1.5 bg-amber-50/70 border-t border-b border-gray-200 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.replace(/^[^a-zA-Z0-9]+/, '').trim())}
              className="text-[10px] font-bold whitespace-nowrap px-2.5 py-1 bg-white hover:bg-amber-100 text-gray-800 border border-black rounded-lg transition-colors cursor-pointer shrink-0 shadow-[1px_1px_0px_0px_#000]"
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
        className="p-2.5 bg-white border-t-2 border-black flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tanya tafsir, tajwid, atau tips hafalan..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-[#F9FAFB] placeholder:text-gray-400 font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 disabled:hover:bg-[#F59E0B] text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          title="Kirim pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
