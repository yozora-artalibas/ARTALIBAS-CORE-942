import React from 'react';
import { SlidersHorizontal, X, LayoutList, Table } from 'lucide-react';
import { MusterSummary } from '../types/personnel';
import { countActiveAdvancedFilters } from '../utils/mobileHelpers';

interface WhatsAppFilterStripProps {
  summary: MusterSummary;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedRank: string;
  selectedSubKet: string;
  searchQuery: string;
  totalFiltered: number;
  totalMaster: number;
  onOpenFilterSheet: () => void;
  onResetFilters: () => void;
  desktopViewMode: 'list' | 'table';
  onChangeDesktopViewMode: (mode: 'list' | 'table') => void;
}

export const WhatsAppFilterStrip: React.FC<WhatsAppFilterStripProps> = ({
  summary,
  selectedStatus,
  onSelectStatus,
  selectedCategory,
  onSelectCategory,
  selectedRank,
  selectedSubKet,
  searchQuery,
  totalFiltered,
  totalMaster,
  onOpenFilterSheet,
  onResetFilters,
  desktopViewMode,
  onChangeDesktopViewMode,
}) => {
  const advancedCount = countActiveAdvancedFilters({ selectedRank, selectedSubKet });
  const isFiltered =
    selectedStatus !== 'Semua' ||
    selectedCategory !== 'Semua' ||
    selectedRank !== 'Semua' ||
    selectedSubKet !== 'Semua' ||
    searchQuery.trim() !== '';

  const isChipActive = (type: 'all' | 'hadir' | 'kurang' | string) => {
    if (type === 'all') return selectedStatus === 'Semua' && selectedCategory === 'Semua';
    if (type === 'hadir') return selectedStatus === 'HADIR' && selectedCategory === 'Semua';
    if (type === 'kurang') return selectedStatus === 'KURANG' && selectedCategory === 'Semua';
    return selectedCategory === type;
  };

  const handleChipClick = (type: 'all' | 'hadir' | 'kurang' | string) => {
    if (type === 'all') {
      onSelectStatus('Semua');
      onSelectCategory('Semua');
    } else if (type === 'hadir') {
      onSelectStatus('HADIR');
      onSelectCategory('Semua');
    } else if (type === 'kurang') {
      onSelectStatus('KURANG');
      onSelectCategory('Semua');
    } else {
      onSelectStatus('Semua');
      onSelectCategory(selectedCategory === type ? 'Semua' : type);
    }
  };

  const chips = [
    { key: 'all', label: `Semua ${summary.total}` },
    { key: 'hadir', label: `Hadir ${summary.hadir}` },
    { key: 'kurang', label: `Kurang ${summary.kurang}` },
    { key: 'DINAS DALAM', label: `Dinas Dalam ${summary.kategoriBreakdown['DINAS DALAM']}` },
    { key: 'DINAS LUAR', label: `Dinas Luar ${summary.kategoriBreakdown['DINAS LUAR']}` },
    { key: 'DINAS KHUSUS', label: `Dinas Khusus ${summary.kategoriBreakdown['DINAS KHUSUS']}` },
    { key: 'LAIN LAIN', label: `Lain-lain ${summary.kategoriBreakdown['LAIN LAIN']}` },
  ];

  return (
    <div className="bg-[#0b141a] border-b border-[#202c33] px-3 sm:px-4 py-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        {/* WhatsApp horizontal filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 py-0.5">
          {chips.map((chip) => {
            const active = isChipActive(chip.key);
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleChipClick(chip.key)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 tabular-nums transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#00a884]/20 text-[#00a884] font-semibold'
                    : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onOpenFilterSheet}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              advancedCount > 0
                ? 'bg-[#00a884]/20 text-[#00a884] font-semibold'
                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter{advancedCount > 0 ? ` (${advancedCount})` : ''}</span>
          </button>
        </div>

        {/* Desktop-only List vs Table toggle */}
        <div className="hidden md:flex items-center bg-[#202c33] rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onChangeDesktopViewMode('list')}
            aria-label="Tampilan Daftar"
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              desktopViewMode === 'list'
                ? 'bg-[#111b21] text-[#00a884]'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDesktopViewMode('table')}
            aria-label="Tampilan Tabel"
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              desktopViewMode === 'table'
                ? 'bg-[#111b21] text-[#00a884]'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabel</span>
          </button>
        </div>
      </div>

      {/* Active filter summary line */}
      {isFiltered && (
        <div className="flex items-center justify-between text-[12px] text-[#8696a0] px-1">
          <span className="truncate tabular-nums">
            Menampilkan <strong className="text-[#e9edef]">{totalFiltered}</strong> dari {totalMaster} personel
            {selectedRank !== 'Semua' ? ` · ${selectedRank}` : ''}
            {selectedSubKet !== 'Semua' ? ` · ${selectedSubKet}` : ''}
            {searchQuery.trim() ? ` · "${searchQuery.trim()}"` : ''}
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[#00a884] hover:underline font-medium shrink-0 ml-2 py-1 px-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
};
