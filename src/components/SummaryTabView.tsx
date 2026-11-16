import React, { useState } from 'react';
import {
  UserCheck,
  UserX,
  Users,
  Building2,
  MapPin,
  Award,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { MusterSummary, Personnel, KategoriDinas } from '../types/personnel';
import { generateLaporanApelText } from '../utils/personnelLogic';

interface SummaryTabViewProps {
  summary: MusterSummary;
  personnelList: Personnel[];
  onNavigateCategory: (cat: KategoriDinas | 'Semua') => void;
  onNavigateStatus: (status: 'HADIR' | 'KURANG' | 'Semua') => void;
  onOpenExportModal: () => void;
}

export const SummaryTabView: React.FC<SummaryTabViewProps> = ({
  summary,
  personnelList,
  onNavigateCategory,
  onNavigateStatus,
  onOpenExportModal,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const hadirPercent = summary.total > 0 ? Math.round((summary.hadir / summary.total) * 100) : 0;
  const reportText = generateLaporanApelText(personnelList);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onOpenExportModal();
    }
  };

  const categoryRows: {
    key: KategoriDinas;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      key: 'SIAP OPS',
      label: 'Siap Ops (Hadir)',
      subtitle: 'Personel hadir di lapangan apel',
      icon: <UserCheck className="w-5 h-5 text-[#00a884]" />,
      count: summary.kategoriBreakdown['SIAP OPS'],
    },
    {
      key: 'DINAS DALAM',
      label: 'Dinas Dalam',
      subtitle: 'Piket Kompi, Satri, Jakam, Dapur, dll.',
      icon: <Building2 className="w-5 h-5 text-sky-400" />,
      count: summary.kategoriBreakdown['DINAS DALAM'],
    },
    {
      key: 'DINAS LUAR',
      label: 'Dinas Luar',
      subtitle: 'Pam Palasari, Korve Korem, dll.',
      icon: <MapPin className="w-5 h-5 text-orange-400" />,
      count: summary.kategoriBreakdown['DINAS LUAR'],
    },
    {
      key: 'DINAS KHUSUS',
      label: 'Dinas Khusus',
      subtitle: 'Dik/Sus/Tar, BP Kotas, dll.',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      count: summary.kategoriBreakdown['DINAS KHUSUS'],
    },
    {
      key: 'LAIN LAIN',
      label: 'Lain-lain',
      subtitle: 'Garjas, Binsik, Staf, ADC, dll.',
      icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
      count: summary.kategoriBreakdown['LAIN LAIN'],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Main Strength Overview */}
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#e9edef]">Ringkasan Kekuatan Apel</h2>
            <p className="text-[12px] text-[#8696a0]">Ketuk angka untuk langsung melihat daftar personel</p>
          </div>
          <span className="text-[14px] font-bold font-mono text-[#00a884] tabular-nums whitespace-nowrap shrink-0">
            {hadirPercent}% Hadir
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-[#202c33] overflow-hidden">
          <div
            className="h-full bg-[#00a884] transition-all duration-300"
            style={{ width: `${hadirPercent}%` }}
          />
        </div>

        {/* 3 Tappable Counters */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateStatus('Semua')}
            className="p-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[12px] text-[#8696a0]">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Jumlah</span>
            </div>
            <div className="text-2xl font-bold text-[#e9edef] font-mono tabular-nums mt-1">
              {summary.total}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateStatus('KURANG')}
            className="p-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[12px] text-amber-400">
              <UserX className="w-3.5 h-3.5" />
              <span>Kurang</span>
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono tabular-nums mt-1">
              {summary.kurang}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateStatus('HADIR')}
            className="p-3 rounded-xl bg-[#00a884]/15 hover:bg-[#00a884]/25 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[12px] text-[#00a884]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Hadir</span>
            </div>
            <div className="text-2xl font-bold text-[#00a884] font-mono tabular-nums mt-1">
              {summary.hadir}
            </div>
          </button>
        </div>
      </div>

      {/* Category Breakdown List (WhatsApp List Style) */}
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#202c33]">
          <h3 className="text-[14px] font-bold text-[#e9edef]">Rincian Per Kategori</h3>
        </div>
        <div className="divide-y divide-[#202c33]">
          {categoryRows.map((row) => (
            <button
              key={row.key}
              type="button"
              onClick={() => onNavigateCategory(row.key)}
              className="w-full min-h-[60px] px-4 py-3 flex items-center gap-3.5 hover:bg-[#202c33]/70 active:bg-[#202c33] transition-colors text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center shrink-0">
                {row.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#e9edef] truncate">{row.label}</div>
                <div className="text-[12px] text-[#8696a0] truncate">{row.subtitle}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[16px] font-bold font-mono text-[#e9edef] tabular-nums">
                  {row.count}
                </span>
                <ChevronRight className="w-4 h-4 text-[#8696a0]" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Copy WhatsApp Report Card */}
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-bold text-[#e9edef]">Laporan Apel Siap Kirim</h3>
            <p className="text-[12px] text-[#8696a0]">Salin langsung untuk dikirim ke grup WhatsApp</p>
          </div>
          <button
            type="button"
            onClick={onOpenExportModal}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[12px] font-semibold text-[#e9edef] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#00a884]" />
            <span>Pratinjau</span>
          </button>
        </div>

        <pre className="p-3 rounded-xl bg-[#0b141a] border border-[#202c33] text-[11px] font-mono text-[#aebac1] max-h-40 overflow-y-auto whitespace-pre-wrap">
          {reportText}
        </pre>

        <button
          type="button"
          onClick={handleCopyReport}
          className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#00bf96] text-[#0b141a] text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Format Apel Tersalin!' : 'Salin Format Apel ke WhatsApp'}</span>
        </button>
      </div>
    </div>
  );
};
