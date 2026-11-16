import React from 'react';
import { Users, UserX, UserCheck, ShieldCheck, Building2, MapPin, Award, Layers } from 'lucide-react';
import { MusterSummary } from '../types/personnel';

interface DashboardStatsProps {
  summary: MusterSummary;
  onFilterByCategory?: (cat: string) => void;
  onFilterByStatus?: (status: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  summary,
  onFilterByCategory,
  onFilterByStatus,
}) => {
  const hadirPercent = summary.total > 0 ? Math.round((summary.hadir / summary.total) * 100) : 0;
  const kurangPercent = summary.total > 0 ? Math.round((summary.kurang / summary.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 3 Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Jumlah Total */}
        <div
          onClick={() => onFilterByStatus?.('Semua')}
          className="cursor-pointer group relative overflow-hidden rounded-xl bg-slate-800/90 border border-slate-700/80 p-5 shadow-sm hover:border-slate-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Jumlah Total
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {summary.total}
            </span>
            <span className="text-xs text-slate-400">Orang Personel</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <span>Kekuatan Nominal</span>
            <span className="font-mono text-sky-400">100%</span>
          </div>
        </div>

        {/* Card 2: Kurang */}
        <div
          onClick={() => onFilterByStatus?.('KURANG')}
          className="cursor-pointer group relative overflow-hidden rounded-xl bg-slate-800/90 border border-amber-500/30 p-5 shadow-sm hover:border-amber-500/60 transition-all hover:shadow-md bg-gradient-to-br from-slate-800 to-amber-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Kurang
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 font-mono">
              {summary.kurang}
            </span>
            <span className="text-xs text-slate-400">Orang Berdinas/Ijin</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <span>Dalam/Luar/Khusus/Lain</span>
            <span className="font-mono font-medium text-amber-400">{kurangPercent}%</span>
          </div>
        </div>

        {/* Card 3: Hadir (Siap Ops) */}
        <div
          onClick={() => onFilterByStatus?.('HADIR')}
          className="cursor-pointer group relative overflow-hidden rounded-xl bg-slate-800/90 border border-emerald-500/30 p-5 shadow-sm hover:border-emerald-500/60 transition-all hover:shadow-md bg-gradient-to-br from-slate-800 to-emerald-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Hadir (Siap Ops)
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 font-mono">
              {summary.hadir}
            </span>
            <span className="text-xs text-slate-400">Orang di Lapangan Apel</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <span>Tingkat Kesiapan</span>
            <span className="font-mono font-medium text-emerald-400">{hadirPercent}%</span>
          </div>
        </div>
      </div>

      {/* Secondary Breakdown Category Pills */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">Rincian:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterByCategory?.('DINAS DALAM')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/70 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Dinas Dalam:</span>
            <span className="font-mono font-bold text-white">
              {summary.kategoriBreakdown['DINAS DALAM']}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterByCategory?.('DINAS LUAR')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/70 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Dinas Luar:</span>
            <span className="font-mono font-bold text-white">
              {summary.kategoriBreakdown['DINAS LUAR']}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterByCategory?.('DINAS KHUSUS')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/70 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Dinas Khusus:</span>
            <span className="font-mono font-bold text-white">
              {summary.kategoriBreakdown['DINAS KHUSUS']}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterByCategory?.('LAIN LAIN')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/70 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Lain-lain:</span>
            <span className="font-mono font-bold text-white">
              {summary.kategoriBreakdown['LAIN LAIN']}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterByCategory?.('SIAP OPS')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Siap Ops:</span>
            <span className="font-mono font-bold text-emerald-200">
              {summary.kategoriBreakdown['SIAP OPS']}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
