import React, { useState } from 'react';
import {
  X,
  History,
  User,
  Clock,
  ArrowRight,
  Filter,
  Search,
  FileSpreadsheet,
  Shield,
  Trash2,
  Lock,
} from 'lucide-react';
import { ChangeHistoryEntry, Personnel } from '../types/personnel';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyEntries: ChangeHistoryEntry[];
  selectedPersonnel?: Personnel | null;
  onClearFilterPersonnel?: () => void;
  onDeleteHistoryEntry?: (id: string) => void;
  onClearAllHistory?: () => void;
  isAdmin?: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyEntries,
  selectedPersonnel,
  onClearFilterPersonnel,
  onDeleteHistoryEntry,
  onClearAllHistory,
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('SEMUA');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter entries
  const filteredEntries = historyEntries.filter((item) => {
    // If specific personnel is selected
    if (selectedPersonnel && item.personnelId !== selectedPersonnel.id) {
      return false;
    }

    // Action filter
    if (actionFilter !== 'SEMUA' && item.actionType !== actionFilter) {
      return false;
    }

    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchName = item.personnelNama.toLowerCase().includes(q);
      const matchPangkat = item.personnelPangkat.toLowerCase().includes(q);
      const matchField = item.fieldChanged.toLowerCase().includes(q);
      const matchOld = item.oldValue.toLowerCase().includes(q);
      const matchNew = item.newValue.toLowerCase().includes(q);
      const matchUser = item.perubah.toLowerCase().includes(q);
      return matchName || matchPangkat || matchField || matchOld || matchNew || matchUser;
    }

    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'UBAH_KATEGORI':
      case 'UBAH_SUB_KETERANGAN':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
      case 'UBAH_STATUS':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'RESET_PATEN':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'HAPUS_KURUNG':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'PERINTAH_CHATBOT':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'RESOLUSI_DUPLIKAT':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID Riwayat',
      'Waktu',
      'Pangkat',
      'Nama Personel',
      'Jenis Aksi',
      'Field Diubah',
      'Nilai Sebelum',
      'Nilai Sesudah',
      'Petugas Perubah',
      'Keterangan Tambahan',
    ];
    const rows = filteredEntries.map((e) => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.personnelPangkat}"`,
      `"${e.personnelNama}"`,
      `"${e.actionType}"`,
      `"${e.fieldChanged}"`,
      `"${e.oldValue}"`,
      `"${e.newValue}"`,
      `"${e.perubah}"`,
      `"${e.keteranganTambahan || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `riwayat_perubahan_kima_${selectedPersonnel ? selectedPersonnel.nama.replace(/\s+/g, '_') : 'semua'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {selectedPersonnel ? (
                    <>
                      Riwayat Perubahan Data:{' '}
                      <span className="text-emerald-400">
                        {selectedPersonnel.pangkat} {selectedPersonnel.nama}
                      </span>
                    </>
                  ) : (
                    'Log Riwayat Perubahan Data Personel Kompi Markas'
                  )}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredEntries.length} Catatan
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>Akses Admin (Bisa Hapus Log)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>User Biasa (Hanya Lihat)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Mencatat setiap modifikasi pada status, kategori, sub-keterangan, petugas perubah, dan timestamp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && historyEntries.length > 0 && onClearAllHistory && (
              isConfirmingClearAll ? (
                <div className="flex items-center gap-1.5 bg-rose-950/80 p-1 rounded-lg border border-rose-500/50">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllHistory();
                      setIsConfirmingClearAll(false);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    title="Klik untuk konfirmasi hapus seluruh catatan riwayat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yakin Hapus Semua?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearAll(false)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-colors cursor-pointer"
                  title="Hapus semua log riwayat perubahan (Khusus Admin)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Unduh log riwayat dalam format CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar inside modal */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari personel, perubahan, atau petugas..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Jenis Aksi:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="SEMUA">Semua Aksi</option>
              <option value="UBAH_SUB_KETERANGAN">Ubah Sub Keterangan</option>
              <option value="UBAH_KATEGORI">Ubah Kategori</option>
              <option value="UBAH_STATUS">Ubah Status</option>
              <option value="HAPUS_KURUNG">Hapus Tanda Kurung</option>
              <option value="RESET_PATEN">Reset Paten</option>
              <option value="RESOLUSI_DUPLIKAT">Resolusi Duplikat</option>
              <option value="PERINTAH_CHATBOT">Perintah Chatbot</option>
              <option value="EDIT_LENGKAP">Edit Lengkap</option>
              <option value="TAMBAH_BARU">Tambah Baru</option>
            </select>

            {selectedPersonnel && onClearFilterPersonnel && (
              <button
                type="button"
                onClick={onClearFilterPersonnel}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700 transition-colors"
              >
                Lihat Semua Personel
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">Belum ada riwayat perubahan yang sesuai.</p>
              <p className="text-xs text-slate-500 mt-1">
                Setiap perubahan pada kategori, status dinas, atau keterangan personel akan otomatis dicatat di sini.
              </p>
            </div>
          ) : (
            <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-800/40">
              <table className="w-full text-left text-xs divide-y divide-slate-700/60">
                <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3.5 py-3">Waktu (WIB)</th>
                    <th className="px-3.5 py-3">Personel</th>
                    <th className="px-3.5 py-3">Jenis Aksi</th>
                    <th className="px-3.5 py-3">Perubahan Data</th>
                    <th className="px-3.5 py-3">Petugas / Pelaku</th>
                    <th className="px-3.5 py-3">Catatan</th>
                    <th className="px-3 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 text-slate-300">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-700/30 transition-colors">
                      {/* Waktu */}
                      <td className="px-3.5 py-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{entry.timestamp}</span>
                        </div>
                      </td>

                      {/* Personel */}
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-200">
                        <span className="text-emerald-400 font-semibold mr-1.5">{entry.personnelPangkat}</span>
                        <span>{entry.personnelNama}</span>
                      </td>

                      {/* Jenis Aksi */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(
                            entry.actionType
                          )}`}
                        >
                          {entry.actionType.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Perubahan Data (Old -> New) */}
                      <td className="px-3.5 py-3">
                        <div className="text-[11px] text-slate-400 mb-1 font-semibold">
                          {entry.fieldChanged}:
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 font-mono text-[11px] line-through">
                            {entry.oldValue || '(kosong)'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono text-[11px] font-semibold">
                            {entry.newValue || '(kosong)'}
                          </span>
                        </div>
                      </td>

                      {/* Petugas */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px]">
                          <User className="w-3 h-3 text-sky-400" />
                          <span>{entry.perubah}</span>
                        </div>
                      </td>

                      {/* Catatan Tambahan */}
                      <td className="px-3.5 py-3 text-slate-400 text-[11px] max-w-[200px] truncate">
                        {entry.keteranganTambahan || '-'}
                      </td>

                      {/* Delete individual log */}
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {isAdmin && onDeleteHistoryEntry ? (
                          confirmDeleteId === entry.id ? (
                            <div className="flex items-center justify-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-rose-500/50">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteHistoryEntry(entry.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                                title="Konfirmasi hapus log ini"
                              >
                                Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] transition-colors cursor-pointer"
                                title="Batal"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(entry.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Hapus baris riwayat ini (Khusus Admin)"
                              aria-label="Hapus baris riwayat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        ) : (
                          <span
                            className="inline-flex items-center justify-center p-1 text-slate-600"
                            title="Hanya Admin yang berhak menghapus riwayat"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredEntries.length} log riwayat</span>
          <div className="flex items-center gap-2">
            {isAdmin && historyEntries.length > 0 && onClearAllHistory && (
              isConfirmingClearAll ? (
                <div className="flex items-center gap-1.5 bg-rose-950/80 p-1 rounded-lg border border-rose-500/50">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllHistory();
                      setIsConfirmingClearAll(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Konfirmasi Hapus Semua Riwayat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearAll(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua Riwayat</span>
                </button>
              )
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
