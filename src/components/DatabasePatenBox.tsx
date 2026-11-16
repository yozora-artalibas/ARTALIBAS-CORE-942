import React, { useState } from 'react';
import {
  Database,
  RotateCcw,
  Search,
  UserPlus,
  Check,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Personnel, KategoriDinas } from '../types/personnel';
import { getRankBadgeStyle, inferCategoryAndStatus, getRankLevel } from '../utils/personnelLogic';

interface DatabasePatenBoxProps {
  personnelList: Personnel[];
  patentCategories: string[];
  onApplyDatabaseToApel: () => void;
  onUpdatePersonnelPaten: (id: number, newPaten: string) => void;
  onUpdatePersonnelName: (id: number, newName: string) => void;
  onUpdatePersonnelPangkat: (id: number, newPangkat: string) => void;
  onDeletePersonnel: (id: number) => void;
  onOpenAddPersonnel: () => void;
  isAdmin?: boolean;
  onOpenGoogleSheetsModal?: () => void;
  autoSyncEnabled?: boolean;
  isGoogleConnected?: boolean;
  lastSyncTime?: string | null;
}

export const DatabasePatenBox: React.FC<DatabasePatenBoxProps> = ({
  personnelList,
  patentCategories,
  onApplyDatabaseToApel,
  onUpdatePersonnelPaten,
  onUpdatePersonnelName,
  onUpdatePersonnelPangkat,
  onDeletePersonnel,
  onOpenAddPersonnel,
  isAdmin = false,
  onOpenGoogleSheetsModal,
  autoSyncEnabled = false,
  isGoogleConnected = false,
  lastSyncTime,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [dbSearch, setDbSearch] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempPangkat, setTempPangkat] = useState<string>('');
  const [tempNama, setTempNama] = useState<string>('');
  const [tempPaten, setTempPaten] = useState<string>('');

  const filteredList = personnelList.filter((p) => {
    if (!dbSearch.trim()) return true;
    const q = dbSearch.toLowerCase();
    return (
      p.nama.toLowerCase().includes(q) ||
      p.pangkat.toLowerCase().includes(q) ||
      p.keterangan_paten.toLowerCase().includes(q)
    );
  });

  const handleStartEdit = (p: Personnel) => {
    setEditingId(p.id);
    setTempPangkat(p.pangkat);
    setTempNama(p.nama);
    setTempPaten(p.keterangan_paten);
  };

  const handleSaveEdit = (id: number) => {
    if (tempNama.trim()) {
      onUpdatePersonnelName(id, tempNama.trim());
    }
    if (tempPangkat.trim()) {
      onUpdatePersonnelPangkat(id, tempPangkat.trim());
    }
    if (tempPaten.trim()) {
      onUpdatePersonnelPaten(id, tempPaten.trim().toUpperCase());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
      {/* Box Header & Sync Callout */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/30">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Database Personel Paten (Master Organik)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {personnelList.length} Personel Terdaftar
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Kelola data paten/organik seluruh personel. Klik tombol hijau di kanan untuk menerapkan data database ini ke status apel saat ini.
            </p>
          </div>
        </div>

        {/* Sync Action Button */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          {/* Google Sheets Live Automation Button */}
          {isAdmin && onOpenGoogleSheetsModal && (
            <button
              type="button"
              id="btn_open_google_sheets_modal"
              onClick={onOpenGoogleSheetsModal}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-md active:scale-95 ${
                autoSyncEnabled && isGoogleConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80 ring-1 ring-emerald-400/40'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
              title="Hubungkan Google Sheets untuk sinkronisasi otomatis database paten secara real-time"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Otomasi Google Sheets</span>
              {autoSyncEnabled && isGoogleConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Auto-Sync Real-Time Aktif" />
              )}
            </button>
          )}

          {isAdmin ? (
            <button
              type="button"
              id="btn_sync_db_to_apel"
              onClick={onApplyDatabaseToApel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50 transition-all cursor-pointer"
              title="Klik untuk menyelaraskan keterangan apel saat ini 100% sesuai dengan database paten ini"
            >
              <RotateCcw className="w-4 h-4 animate-spin-hover" />
              <span>Terapkan Database ke Keterangan Apel</span>
            </button>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
              title="Hanya Admin yang berhak merubah database atau menerapkan database ke apel"
            >
              <span>🔒 Ubah Database (Khusus Admin)</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title={isExpanded ? 'Tutup rincian database' : 'Buka database'}
          >
            <span>{isExpanded ? 'Sembunyikan' : isAdmin ? 'Buka & Ubah Database' : 'Buka & Lihat Database'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Table & Quick Editor */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-950/70">
          {!isAdmin && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Mode Baca (User Biasa): Hanya Admin yang memiliki izin untuk menambah, mengedit, atau menghapus data di Database Personel Paten.
              </span>
            </div>
          )}
          {/* Controls: Search & Add */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                placeholder="Cari nama, pangkat, atau keterangan paten di database..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
              {dbSearch && (
                <button
                  type="button"
                  onClick={() => setDbSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAddPersonnel}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Personel ke Database</span>
              </button>
            )}
          </div>

          {/* Database Table (Mobile-friendly, high contrast) */}
          <div className="border border-slate-700 rounded-xl overflow-x-auto max-h-[380px] scrollbar-thin bg-slate-900/60">
            <table className="w-full text-left text-xs divide-y divide-slate-700/60">
              <thead className="bg-slate-900 text-[11px] font-bold text-slate-300 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">No</th>
                  <th className="px-3 py-3 w-28">Pangkat</th>
                  <th className="px-3 py-3 w-48">Nama Personel</th>
                  <th className="px-3 py-3 w-52">Keterangan Paten Organik</th>
                  <th className="px-3 py-3 w-32">Kategori Utama</th>
                  <th className="px-3 py-3 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-slate-200">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada personel yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((person, idx) => {
                    const isEditing = editingId === person.id;
                    const { category } = inferCategoryAndStatus(person.keterangan_paten);

                    return (
                      <tr
                        key={person.id}
                        className={`hover:bg-slate-800/80 transition-colors ${
                          idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-850/60'
                        }`}
                      >
                        {/* No */}
                        <td className="px-3 py-2.5 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Pangkat */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempPangkat}
                              onChange={(e) => setTempPangkat(e.target.value)}
                              className="w-24 px-2 py-1 bg-slate-950 border border-amber-500 rounded text-xs text-white font-bold"
                            />
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border font-bold ${getRankBadgeStyle(
                                person.pangkat
                              )}`}
                            >
                              {person.pangkat}
                            </span>
                          )}
                        </td>

                        {/* Nama */}
                        <td className="px-3 py-2.5 font-semibold text-slate-100 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempNama}
                              onChange={(e) => setTempNama(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-950 border border-emerald-500 rounded text-xs text-white"
                            />
                          ) : (
                            person.nama
                          )}
                        </td>

                        {/* Keterangan Paten */}
                        <td className="px-3 py-2.5">
                          {isEditing ? (
                            <div className="relative">
                              <input
                                type="text"
                                list="db-paten-options"
                                value={tempPaten}
                                onChange={(e) => setTempPaten(e.target.value.toUpperCase())}
                                className="w-full px-2 py-1 bg-slate-950 border border-sky-500 rounded text-xs text-white font-mono uppercase"
                              />
                              <datalist id="db-paten-options">
                                {patentCategories.map((c) => (
                                  <option key={c} value={c} />
                                ))}
                                <option value="SIAP OPS" />
                                <option value="LAIN LAIN" />
                              </datalist>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                              {person.keterangan_paten}
                            </span>
                          )}
                        </td>

                        {/* Kategori Utama */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {category}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {!isAdmin ? (
                            <span className="text-[10px] text-slate-500 font-mono italic">
                              🔒 Khusus Admin
                            </span>
                          ) : isEditing ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(person.id)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                title="Simpan perubahan database"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                                title="Batal"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(person)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 cursor-pointer"
                                title="Edit data personel di database"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeletePersonnel(person.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer"
                                title="Hapus dari database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1">
            <span>
              Menampilkan {filteredList.length} dari {personnelList.length} personel di database organik.
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={onApplyDatabaseToApel}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Terapkan Database Sekarang</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
