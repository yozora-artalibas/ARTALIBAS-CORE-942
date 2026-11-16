import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  ArrowLeft,
  X,
  FileText,
  AlertTriangle,
  History,
  CheckSquare,
  ArrowUpDown,
  ListFilter,
  RotateCcw,
  FolderPlus,
  UserPlus,
  ArrowRightLeft,
  FileSpreadsheet,
  Users,
  Smartphone,
  LogOut,
  Shield,
  Download,
} from 'lucide-react';
const APP_LOGO_URL = '/assets/aistudio/file_00000000adb882118c0986c80aed6bf3_781e86f5.png';
import { AppUser } from '../types/auth';
import { getRoleDisplayName } from '../utils/authManager';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenDuplicateModal: () => void;
  onOpenHistory: () => void;
  onOpenUserManagement: () => void;
  onLogout: () => void;
  onSortPangkatNama: () => void;
  onSortKeteranganApel: () => void;
  onResetAllToPaten: () => void;
  onOpenAddCategory: () => void;
  onOpenAddPersonnel: () => void;
  onCopyApelToPaten: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenInstallModal: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalPersonnel: number;
  hadirCount: number;
  hasDuplicates: boolean;
  duplicateCount: number;
  totalHistoryCount?: number;
  currentUser: AppUser | null;
  pendingUserCount?: number;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenDuplicateModal,
  onOpenHistory,
  onOpenUserManagement,
  onLogout,
  onSortPangkatNama,
  onSortKeteranganApel,
  onResetAllToPaten,
  onOpenAddCategory,
  onOpenAddPersonnel,
  onCopyApelToPaten,
  onOpenGoogleSheetsModal,
  onOpenInstallModal,
  isSelectionMode,
  onToggleSelectionMode,
  searchQuery,
  onSearchChange,
  totalPersonnel,
  hadirCount,
  hasDuplicates,
  duplicateCount,
  totalHistoryCount = 0,
  currentUser,
  pendingUserCount = 0,
  isAdmin,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        if (isSearchOpen && !searchQuery) {
          setIsSearchOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchOpen, searchQuery]);

  const alertBadgeCount = (isAdmin ? pendingUserCount : 0) + (hasDuplicates ? 1 : 0);

  const runMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#111b21] border-b border-[#2a3942] px-2 sm:px-4">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between gap-2">
        {isSearchOpen ? (
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                onSearchChange('');
              }}
              aria-label="Tutup Pencarian"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#aebac1] hover:bg-[#202c33] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nama, pangkat, atau keterangan..."
              aria-label="Cari personel"
              className="flex-1 bg-transparent text-[15px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none py-2"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Hapus Kata Kunci"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#aebac1] hover:bg-[#202c33] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Left: Avatar + Single-line Title & Quiet Subtitle */}
            <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#2a3942] bg-white p-0.5 shrink-0">
                <img
                  src={APP_LOGO_URL}
                  alt="Logo ARTALIBAS CORE 942"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[15.5px] sm:text-[17px] font-bold tracking-tight text-[#e9edef] leading-tight truncate">
                  ARTALIBAS CORE 942
                </h1>
                <p className="text-[12px] text-[#8696a0] leading-tight truncate tabular-nums">
                  {totalPersonnel} personel · Hadir {hadirCount} · {currentUser?.username || 'Operator'}
                </p>
              </div>
            </div>

            {/* Right: Install (when ready) + Search Icon + 3-Dot Overflow Menu (⋮) */}
            <div className="flex items-center gap-0.5 shrink-0" ref={menuRef}>
              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  id="btn_header_install"
                  onClick={install}
                  aria-label="Pasang Aplikasi"
                  title="Pasang Aplikasi di Chrome"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#00a884] hover:bg-[#202c33] transition-colors cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                id="btn_header_search"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Cari Personel"
                title="Cari Personel"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#aebac1] hover:bg-[#202c33] hover:text-white transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  id="btn_menu_titik_tiga"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-label="Menu Utama"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  title="Menu Lainnya"
                  className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#aebac1] hover:bg-[#202c33] hover:text-white transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5" />
                  {alertBadgeCount > 0 && (
                    <span
                      aria-label={`${alertBadgeCount} pemberitahuan`}
                      className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[#111b21]"
                    />
                  )}
                </button>

                {/* WhatsApp-style 3-Dot Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Menu Navigasi dan Pengaturan"
                    className="absolute right-0 top-12 w-72 max-w-[calc(100vw-16px)] bg-[#233138] rounded-xl shadow-2xl border border-[#2a3942] py-1 z-50 max-h-[88vh] overflow-y-auto"
                  >
                    {/* User Info Strip */}
                    {currentUser && (
                      <div className="px-4 py-2 border-b border-[#2a3942]">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#e9edef] truncate">
                          <Shield className="w-4 h-4 text-[#00a884] shrink-0" />
                          <span className="truncate">{currentUser.namaLengkap}</span>
                        </div>
                        <p className="text-[11px] text-[#8696a0] truncate">
                          @{currentUser.username} · {getRoleDisplayName(currentUser)}
                        </p>
                      </div>
                    )}

                    {/* Group 1: Laporan & Audit */}
                    <div className="py-0.5 border-b border-[#2a3942]">
                      <div className="px-4 py-0.5 text-[10px] font-semibold text-[#8696a0]">
                        Laporan & Audit
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onOpenExport)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#00a884] shrink-0" />
                        <span className="flex-1 truncate">Format Laporan Apel (WA)</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onOpenDuplicateModal)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${hasDuplicates ? 'text-amber-400' : 'text-[#8696a0]'}`} />
                        <span className="flex-1 truncate">Audit Duplikat</span>
                        {duplicateCount > 0 && (
                          <span className="text-[12px] font-bold text-amber-400 tabular-nums">
                            {duplicateCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onOpenHistory)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <History className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="flex-1 truncate">Riwayat Perubahan</span>
                        {totalHistoryCount > 0 && (
                          <span className="text-[12px] text-[#8696a0] tabular-nums">
                            {totalHistoryCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Group 2: Atur Daftar Apel */}
                    <div className="py-0.5 border-b border-[#2a3942]">
                      <div className="px-4 py-0.5 text-[10px] font-semibold text-[#8696a0]">
                        Atur Daftar Apel
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onToggleSelectionMode)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <CheckSquare className={`w-4 h-4 shrink-0 ${isSelectionMode ? 'text-[#00a884]' : 'text-[#aebac1]'}`} />
                        <span className="flex-1 truncate">
                          {isSelectionMode ? 'Selesai Pilih Banyak' : 'Pilih Banyak Personel'}
                        </span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onSortPangkatNama)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <ArrowUpDown className="w-4 h-4 text-[#aebac1] shrink-0" />
                        <span className="flex-1 truncate">Urutkan Pangkat & Nama</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onSortKeteranganApel)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <ListFilter className="w-4 h-4 text-[#aebac1] shrink-0" />
                        <span className="flex-1 truncate">Urutkan Keterangan Apel</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onResetAllToPaten)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-amber-300 hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="flex-1 truncate">Reset Semua ke Paten</span>
                      </button>
                    </div>

                    {/* Group 3: Master Data */}
                    <div className="py-0.5 border-b border-[#2a3942]">
                      <div className="px-4 py-0.5 text-[10px] font-semibold text-[#8696a0]">
                        Master & Kategori
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onOpenAddCategory)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <FolderPlus className="w-4 h-4 text-[#00a884] shrink-0" />
                        <span className="flex-1 truncate">Kelola Paten & Sub Ket</span>
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => runMenuAction(onOpenAddPersonnel)}
                            className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-4 h-4 text-sky-400 shrink-0" />
                            <span className="flex-1 truncate">Tambah Personel Paten</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => runMenuAction(onCopyApelToPaten)}
                            className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="flex-1 truncate">Salin Apel ke Paten</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => runMenuAction(onOpenGoogleSheetsModal)}
                            className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-[#00a884] shrink-0" />
                            <span className="flex-1 truncate">Otomasi Google Sheets</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Group 4: Akun */}
                    <div className="py-0.5">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => runMenuAction(onOpenUserManagement)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-[#00a884] shrink-0" />
                        <span className="flex-1 truncate">Data User & Profil</span>
                        {isAdmin && pendingUserCount > 0 && (
                          <span className="text-[12px] font-bold text-[#00a884] tabular-nums">
                            {pendingUserCount} baru
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        id="btn_open_pwa_install"
                        onClick={() => runMenuAction(onOpenInstallModal)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-[#e9edef] hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-[#00a884] shrink-0" />
                        <span className="flex-1 truncate">Pasang di HP & Bagikan</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        id="btn_logout"
                        onClick={() => runMenuAction(onLogout)}
                        className="w-full min-h-[40px] px-4 py-1.5 text-left text-[13.5px] text-rose-400 hover:bg-[#182229] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="flex-1 truncate">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
