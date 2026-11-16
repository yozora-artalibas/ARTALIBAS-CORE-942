import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Download,
  Zap,
  Info,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  fetchSpreadsheetMetadata,
  fetchPersonnelFromSheet,
  exportPersonnelToSheet,
  parseSpreadsheetId,
  SheetMetadata,
} from '../services/googleSheetsService';
import { Personnel } from '../types/personnel';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: User | null;
  googleToken: string | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  personnelList: Personnel[];
  onApplySheetData: (newPersonnel: Personnel[], newCategories: string[]) => void;
  savedSheetUrl: string;
  onSaveSheetUrl: (url: string) => void;
  savedSheetTab: string;
  onSaveSheetTab: (tab: string) => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  lastSyncTime: string | null;
  isAdmin?: boolean;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  googleToken,
  onGoogleSignIn,
  onGoogleSignOut,
  personnelList,
  onApplySheetData,
  savedSheetUrl,
  onSaveSheetUrl,
  savedSheetTab,
  onSaveSheetTab,
  autoSyncEnabled,
  onToggleAutoSync,
  lastSyncTime,
  isAdmin = false,
}) => {
  const [sheetInput, setSheetInput] = useState<string>(savedSheetUrl || '');
  const [selectedTab, setSelectedTab] = useState<string>(savedSheetTab || '');
  const [metadata, setMetadata] = useState<SheetMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showStructureGuide, setShowStructureGuide] = useState<boolean>(false);

  useEffect(() => {
    setSheetInput(savedSheetUrl);
  }, [savedSheetUrl]);

  useEffect(() => {
    setSelectedTab(savedSheetTab);
  }, [savedSheetTab]);

  // When token and input are available, automatically fetch metadata
  useEffect(() => {
    if (googleToken && sheetInput.trim()) {
      handleLoadMetadata(false);
    }
  }, [googleToken]);

  if (!isOpen) return null;

  const handleLoadMetadata = async (showSuccessMsg = true) => {
    const rawId = parseSpreadsheetId(sheetInput);
    if (!rawId) {
      setStatusMsg({ text: 'Masukkan tautan (link) atau ID Google Spreadsheet.', type: 'error' });
      return;
    }
    if (!googleToken) {
      setStatusMsg({ text: 'Silakan hubungkan akun Google terlebih dahulu.', type: 'error' });
      return;
    }

    setIsLoadingMetadata(true);
    setStatusMsg(null);
    try {
      const meta = await fetchSpreadsheetMetadata(rawId, googleToken);
      setMetadata(meta);
      onSaveSheetUrl(sheetInput.trim());

      // If no tab selected or not in list, select first tab
      const currentTab = selectedTab && meta.sheets.includes(selectedTab) ? selectedTab : meta.sheets[0];
      setSelectedTab(currentTab);
      onSaveSheetTab(currentTab);

      if (showSuccessMsg) {
        setStatusMsg({
          text: `Spreadsheet "${meta.title}" berhasil terhubung (${meta.sheets.length} tab terdeteksi).`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        text: err.message || 'Gagal memuat Google Sheet. Pastikan akun Google memiliki izin akses file ini.',
        type: 'error',
      });
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleManualSyncNow = async () => {
    const rawId = parseSpreadsheetId(sheetInput);
    if (!rawId || !googleToken) {
      setStatusMsg({ text: 'Hubungkan Google Sheet terlebih dahulu sebelum sinkronisasi.', type: 'error' });
      return;
    }

    const tabToUse = selectedTab || metadata?.sheets[0] || 'Sheet1';
    setIsSyncing(true);
    setStatusMsg(null);

    try {
      const result = await fetchPersonnelFromSheet(rawId, tabToUse, googleToken, personnelList);
      if (result.personnel.length === 0) {
        setStatusMsg({
          text: 'Tidak ada baris data personel yang ditemukan di sheet ini. Pastikan format kolom sesuai.',
          type: 'error',
        });
        return;
      }

      onApplySheetData(result.personnel, result.categories);
      setStatusMsg({
        text: `Berhasil sinkronisasi! ${result.personnel.length} data personel paten otomatis diperbarui langsung dari Google Sheets.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        text: err.message || 'Terjadi kesalahan saat membaca data dari Google Sheet.',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportToSheet = async () => {
    if (!isAdmin) {
      setStatusMsg({ text: 'Hanya Administrator Utama dan Admin yang berhak mengekspor data ke Google Sheets.', type: 'error' });
      return;
    }

    const rawId = parseSpreadsheetId(sheetInput);
    if (!rawId || !googleToken) {
      setStatusMsg({ text: 'Hubungkan Google Sheet terlebih dahulu.', type: 'error' });
      return;
    }

    const tabToUse = selectedTab || metadata?.sheets[0] || 'Sheet1';

    // Mandatory user confirmation for mutating Workspace data per Constitution
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mengekspor seluruh ${personnelList.length} data personel database paten saat ini ke tab "${tabToUse}" di Google Sheet? Data pada rentang A1:F di lembar kerja tersebut akan ditimpa.`
    );
    if (!confirmed) return;

    setIsExporting(true);
    setStatusMsg(null);

    try {
      await exportPersonnelToSheet(rawId, tabToUse, personnelList, googleToken);
      setStatusMsg({
        text: `Sukses! Seluruh ${personnelList.length} data personel paten berhasil diekspor ke tab "${tabToUse}".`,
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        text: err.message || 'Gagal mengekspor data ke Google Sheet.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Otomasi Database Paten via Google Sheets
              </h3>
              <p className="text-xs text-slate-400">
                Ubah di Google Sheet, database paten langsung berubah otomatis tanpa perlu republish
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : statusMsg.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          {/* Step 1: Account Connection */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  1
                </span>
                Koneksi Akun Google
              </span>
              {googleUser && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Terhubung
                </span>
              )}
            </div>

            {!googleUser ? (
              <div className="space-y-2 pt-1">
                <p className="text-slate-300 text-xs">
                  Hubungkan akun Google Anda untuk membaca data Google Sheet secara langsung secara real-time.
                </p>
                <GoogleSignInButton onClick={onGoogleSignIn} text="Hubungkan dengan Google" />
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-slate-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                      {googleUser.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white text-xs">{googleUser.displayName || 'Pengguna Google'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{googleUser.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onGoogleSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Putuskan</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Spreadsheet URL & Sheet Selection */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <span className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                2
              </span>
              Tautan Google Spreadsheet
            </span>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">
                URL atau ID Google Sheet
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X.../edit"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleLoadMetadata(true)}
                  disabled={!googleToken || !sheetInput.trim() || isLoadingMetadata}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMetadata ? 'animate-spin' : ''}`} />
                  <span>{isLoadingMetadata ? 'Memuat...' : 'Muat Sheet'}</span>
                </button>
              </div>
            </div>

            {/* Sheet Tabs Dropdown */}
            {metadata && (
              <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Judul File: <strong className="text-white">{metadata.title}</strong></span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${parseSpreadsheetId(sheetInput)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Pilih Tab Lembar Kerja:</label>
                  <select
                    value={selectedTab}
                    onChange={(e) => {
                      setSelectedTab(e.target.value);
                      onSaveSheetTab(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  >
                    {metadata.sheets.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Auto-Sync Settings & Actions */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  3
                </span>
                Pengaturan Sinkronisasi Otomatis
              </span>

              {/* Auto Sync Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSyncEnabled}
                  onChange={(e) => onToggleAutoSync(e.target.checked)}
                  disabled={!googleToken || !metadata}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-50"></div>
                <span className="ml-2 text-xs font-semibold text-slate-300">
                  {autoSyncEnabled ? 'Auto-Sync Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Auto-Sync Real-Time:</strong> Ketika Anda mengubah data atau keterangan di Google Sheet dan kembali ke aplikasi, database paten akan langsung disinkronkan secara otomatis tanpa menekan tombol republish apapun.
              </div>
            </div>

            {lastSyncTime && (
              <p className="text-[11px] text-slate-400 font-mono">
                Terakhir disinkronkan: <span className="text-slate-200">{new Date(lastSyncTime).toLocaleString('id-ID')}</span>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleManualSyncNow}
                disabled={!googleToken || isSyncing || !metadata}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleExportToSheet}
                  disabled={!googleToken || isExporting || !metadata}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Kirim 94 data personel database paten saat ini ke Google Sheet Anda"
                >
                  <Upload className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                  <span>{isExporting ? 'Sedang Mengekspor...' : 'Ekspor Database ke Sheet Ini'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowStructureGuide((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer ml-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showStructureGuide ? 'Tutup Format Kolom' : 'Lihat Format Kolom'}</span>
              </button>
            </div>

            {/* Format Column Guide */}
            {showStructureGuide && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-2 animate-fadeIn">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-400" />
                  Format Kolom Google Sheet yang Didukung:
                </p>
                <p className="text-slate-300">
                  Aplikasi secara cerdas mendeteksi baris judul di baris 1. Pastikan kolom memiliki susunan berikut:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono border border-slate-700">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="p-1.5 border border-slate-700">Kolom A</th>
                        <th className="p-1.5 border border-slate-700">Kolom B</th>
                        <th className="p-1.5 border border-slate-700">Kolom C</th>
                        <th className="p-1.5 border border-slate-700">Kolom D</th>
                        <th className="p-1.5 border border-slate-700">Kolom E</th>
                        <th className="p-1.5 border border-slate-700">Kolom F</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="p-1.5 border border-slate-700 font-bold text-emerald-300">No</td>
                        <td className="p-1.5 border border-slate-700 font-bold text-emerald-300">Pangkat</td>
                        <td className="p-1.5 border border-slate-700 font-bold text-emerald-300">Nama Personel</td>
                        <td className="p-1.5 border border-slate-700 font-bold text-emerald-300">Kategori Utama</td>
                        <td className="p-1.5 border border-slate-700 font-bold text-emerald-300">Keterangan Paten</td>
                        <td className="p-1.5 border border-slate-700 font-bold text-emerald-300">Catatan</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border border-slate-700">1</td>
                        <td className="p-1.5 border border-slate-700">Prada</td>
                        <td className="p-1.5 border border-slate-700">Abel</td>
                        <td className="p-1.5 border border-slate-700">DINAS DALAM</td>
                        <td className="p-1.5 border border-slate-700">PROVOOST</td>
                        <td className="p-1.5 border border-slate-700">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-400">
                  💡 Tips: Jika sheet Anda masih kosong, Anda dapat menekan tombol <strong>"Ekspor Database ke Sheet Ini"</strong> untuk otomatis membuat struktur tabel dan mengisi 94 data personel awal secara instan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
