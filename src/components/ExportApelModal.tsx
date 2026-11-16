import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileText } from 'lucide-react';
import { Personnel } from '../types/personnel';
import { generateLaporanApelText } from '../utils/personnelLogic';

interface ExportApelModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
}

export const ExportApelModal: React.FC<ExportApelModalProps> = ({
  isOpen,
  onClose,
  personnelList,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const reportText = generateLaporanApelText(personnelList);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Format Laporan Apel Kompi Markas</h3>
              <p className="text-xs font-mono text-emerald-400 font-bold uppercase">
                YONIF TP 942/ARYA WANGSAKARA • Pelaporan Apel Harian
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pratinjau Teks Apel:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks'}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {reportText}
          </pre>
        </div>

        <div className="px-6 py-3.5 bg-slate-800/90 border-t border-slate-700 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
