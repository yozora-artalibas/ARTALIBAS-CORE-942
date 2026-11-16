import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bot,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eraser,
  ListFilter,
} from 'lucide-react';
import { ChatMessage, Personnel } from '../types/personnel';

interface ChatbotContainerProps {
  onExecuteCommand: (command: string) => { success: boolean; message: string; action?: string };
  messages: ChatMessage[];
  onClearChat?: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onFilterStatus?: (status: 'SEMUA' | 'HADIR' | 'KURANG') => void;
  onOpenDuplicateModal?: () => void;
  onOpenExportApel?: () => void;
}

const QUICK_PROMPTS = [
  'cek data personel ganda maupun kurang',
  'cek data personel ganda',
  'cek data personel kurang',
  'kembalikan semua personel ke keterangan paten',
  'masukan Prada .../ Serda ... ke keterangan siapops',
  'tampilkan personel pangkat Serda',
  'cek kelengkapan apel',
  'Jumlah: 94 Kurang: 86 Hadir: 8',
];

export const ChatbotContainer: React.FC<ChatbotContainerProps> = ({
  onExecuteCommand,
  messages,
  onClearChat,
  isOpen,
  onToggleOpen,
  onFilterStatus,
  onOpenDuplicateModal,
  onOpenExportApel,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isProcessing) return;

    setIsProcessing(true);
    setInputText('');
    setTimeout(() => {
      onExecuteCommand(trimmed);
      setIsProcessing(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter without shift on desktop, submit. Shift+Enter creates newline.
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 640) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    if (prompt.startsWith('Jumlah:')) {
      setInputText(
`Jumlah: 94
Kurang: 86
Hadir: 8
Keterangan:

DINAS DALAM:
1. Prada Ryan
2. Serda Zulfi

PAM PALASARI:
1. Serda Zulfi
2. Prada Arif Hidayat

SIAP OPS:
1. Prada Arif Hidayat`
      );
      return;
    }
    setInputText(prompt);
    if (!prompt.includes('...')) {
      setTimeout(() => {
        onExecuteCommand(prompt);
      }, 100);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-700 shadow-2xl transition-all duration-300">
      {/* Header bar */}
      <div
        onClick={onToggleOpen}
        className="px-4 sm:px-6 py-2.5 bg-slate-800/95 hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-slate-700/60 select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                Asisten Chatbot KIMA
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                AUDIT WA & NLP AKTIF
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            {isOpen ? 'Klik untuk meminimalkan' : 'Klik untuk membuka asisten / tempel pesan apel WA'}
          </span>
          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-white"
            aria-label={isOpen ? 'Tutup Asisten' : 'Buka Asisten'}
          >
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Drawer Body (Height adapted for 4 lines WA textarea) */}
      {isOpen && (
        <div className="h-[460px] sm:h-[420px] flex flex-col bg-slate-950/95">
          {/* Quick suggestions row */}
          <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Saran:
            </span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuickPromptClick(prompt)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                {prompt.startsWith('Jumlah:') ? '📋 Contoh Format Apel WA' : prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const isSystem = msg.sender === 'system';

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isSystem
                      ? 'justify-center'
                      : isAssistant
                      ? 'justify-start'
                      : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isSystem
                        ? 'bg-slate-900/90 text-slate-400 border border-slate-800 text-center font-mono text-[11px]'
                        : isAssistant
                        ? 'bg-slate-800/95 text-slate-100 border border-slate-700 shadow-sm rounded-tl-sm'
                        : 'bg-emerald-600 text-white shadow-sm rounded-tr-sm'
                    }`}
                  >
                    {!isSystem && (
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75 font-mono">
                        <span>{isAssistant ? 'Asisten KIMA' : 'Petugas Apel'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Quick action buttons for assistant responses */}
                    {isAssistant && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                        {(msg.actionExecuted === 'CHECK_KURANG' ||
                          msg.actionExecuted === 'CHECK_DUPLICATES_AND_KURANG' ||
                          msg.actionExecuted === 'CHECK_MUSTER_TEXT') && onFilterStatus && (
                          <>
                            <button
                              type="button"
                              onClick={() => onFilterStatus('KURANG')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1"
                            >
                              <ListFilter className="w-3 h-3" />
                              Filter Tabel: Personel Kurang
                            </button>
                            <button
                              type="button"
                              onClick={() => onFilterStatus('SEMUA')}
                              className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
                            >
                              Reset Filter
                            </button>
                          </>
                        )}

                        {(msg.actionExecuted === 'CHECK_DUPLICATES' ||
                          msg.actionExecuted === 'CHECK_DUPLICATES_AND_KURANG' ||
                          msg.actionExecuted === 'CHECK_MUSTER_TEXT') &&
                          onOpenDuplicateModal && (
                            <button
                              type="button"
                              onClick={onOpenDuplicateModal}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Penyelarasan Duplikat
                            </button>
                          )}

                        {onOpenExportApel && (
                          <button
                            type="button"
                            onClick={onOpenExportApel}
                            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Format Apel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* WA-Style Multi-line Input Bar (At least 4 lines visible) */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-end gap-2.5"
          >
            <div className="flex-1 relative flex flex-col">
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik perintah atau tempel pesan apel WA berformat 'Jumlah: ... Kurang: ... Keterangan: ...' (bisa kirim 2 data keterangan untuk dibandingkan)"
                className="w-full min-h-[96px] max-h-[140px] px-3.5 py-2.5 rounded-xl bg-slate-800/95 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-y font-sans leading-relaxed"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                <span>WA Multi-line • Mendukung teks panjang & perbandingan 2 data apel</span>
                {inputText.length > 0 && <span>{inputText.length} karakter</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0 self-end mb-4">
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 font-semibold text-xs"
                title="Kirim (Enter di PC / Tekan di HP)"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
              {inputText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 text-[10px] transition-colors border border-slate-700"
                >
                  Hapus Teks
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
