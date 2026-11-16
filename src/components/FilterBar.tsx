import React from 'react';
import { Search, Filter, X, Shield, Tag, Bookmark } from 'lucide-react';
import { KategoriDinas } from '../types/personnel';

interface FilterBarProps {
  selectedRank: string;
  onSelectRank: (rank: string) => void;
  availableRanks?: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  availableCategories?: string[];
  selectedSubKet?: string;
  onSelectSubKet?: (sub: string) => void;
  availableSubKet?: string[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalFiltered: number;
  totalMaster: number;
  onResetFilters: () => void;
}

const DEFAULT_RANKS = ['Semua', 'Letda', 'Serka', 'Sertu', 'Serda', 'Praka', 'Pratu', 'Prada'];
const DEFAULT_CATEGORIES: (string | KategoriDinas)[] = [
  'Semua',
  'DINAS DALAM',
  'DINAS LUAR',
  'DINAS KHUSUS',
  'LAIN LAIN',
  'SIAP OPS',
];
const STATUS_OPTIONS = ['Semua', 'HADIR', 'KURANG'];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedRank,
  onSelectRank,
  availableRanks = DEFAULT_RANKS,
  selectedCategory,
  onSelectCategory,
  availableCategories = DEFAULT_CATEGORIES,
  selectedSubKet = 'Semua',
  onSelectSubKet,
  availableSubKet = [],
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  totalFiltered,
  totalMaster,
  onResetFilters,
}) => {
  const isFiltered =
    selectedRank !== 'Semua' ||
    selectedCategory !== 'Semua' ||
    selectedSubKet !== 'Semua' ||
    selectedStatus !== 'Semua' ||
    searchQuery.trim() !== '';

  return (
    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 shadow-sm space-y-3.5">
      {/* Top Search & Status row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama personel, pangkat, atau keterangan..."
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs (Semua, HADIR, KURANG) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-700 self-start md:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            Status:
          </span>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onSelectStatus(st)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? st === 'HADIR'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : st === 'KURANG'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row 2: Ranks and Categories */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
        {/* Filter by Rank (Dynamic: includes newly added ranks) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pangkat:</span>
          </span>
          {availableRanks.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => onSelectRank(rank)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedRank === rank
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold ring-1 ring-emerald-400'
                  : 'bg-slate-900/60 text-slate-300 border border-slate-700/60 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5 text-sky-400" />
            <span>Kategori:</span>
          </span>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm font-semibold ring-1 ring-sky-400'
                  : 'bg-slate-900/60 text-slate-300 border border-slate-700/60 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row 3: Sub Keterangan (Identical visual style to Pangkat & Kategori) */}
      {availableSubKet && availableSubKet.length > 0 && onSelectSubKet && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/60">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Sub Keterangan:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto scrollbar-thin py-0.5">
            {availableSubKet.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => onSelectSubKet(sub)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedSubKet === sub
                    ? 'bg-amber-600 text-white shadow-sm font-semibold ring-1 ring-amber-400'
                    : 'bg-slate-900/60 text-slate-300 border border-slate-700/60 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results and reset state */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div>
          Menampilkan <span className="font-semibold text-slate-200">{totalFiltered}</span> dari{' '}
          <span className="font-semibold text-slate-200">{totalMaster}</span> personel
          {isFiltered && <span className="text-emerald-400 ml-1.5 font-medium">(Terfilter)</span>}
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        )}
      </div>
    </div>
  );
};
