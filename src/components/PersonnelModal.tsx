import React, { useState, useEffect } from 'react';
import { X, UserCheck, Shield } from 'lucide-react';
import { Personnel, KategoriDinas, StatusDinas } from '../types/personnel';
import { getRankLevel, inferCategoryAndStatus } from '../utils/personnelLogic';
import { QUICK_APEL_PRESETS, QuickPresetOption } from '../utils/mobileHelpers';

interface PersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Personnel) => void;
  personnelToEdit?: Personnel | null;
  patentCategories: string[];
  syncedPresets?: QuickPresetOption[];
  isAdmin?: boolean;
}

const RANK_LIST = [
  'Letda Inf',
  'Letda Ckm',
  'Letda Cke',
  'Letda Cba',
  'Serka',
  'Sertu',
  'Serda',
  'Praka',
  'Pratu',
  'Prada',
];

const CATEGORIES: KategoriDinas[] = [
  'DINAS DALAM',
  'DINAS LUAR',
  'DINAS KHUSUS',
  'LAIN LAIN',
  'SIAP OPS',
];

export const PersonnelModal: React.FC<PersonnelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  personnelToEdit,
  patentCategories,
  syncedPresets = QUICK_APEL_PRESETS,
  isAdmin = false,
}) => {
  const [pangkat, setPangkat] = useState<string>('Prada');
  const [nama, setNama] = useState<string>('');
  const [keteranganPaten, setKeteranganPaten] = useState<string>('LAIN LAIN');
  const [kategoriSaatIni, setKategoriSaatIni] = useState<KategoriDinas>('SIAP OPS');
  const [subKeterangan, setSubKeterangan] = useState<string>('SIAP OPS');
  const [statusDinas, setStatusDinas] = useState<StatusDinas>('HADIR');
  const [catatan, setCatatan] = useState<string>('');

  useEffect(() => {
    if (personnelToEdit) {
      setPangkat(personnelToEdit.pangkat);
      setNama(personnelToEdit.nama);
      setKeteranganPaten(personnelToEdit.keterangan_paten);
      setKategoriSaatIni(personnelToEdit.kategori_saat_ini);
      setSubKeterangan(personnelToEdit.sub_keterangan_saat_ini);
      setStatusDinas(personnelToEdit.status_dinas);
      setCatatan(personnelToEdit.catatan || '');
    } else {
      setPangkat('Prada');
      setNama('');
      setKeteranganPaten(patentCategories[0] || 'LAIN LAIN');
      setKategoriSaatIni('SIAP OPS');
      setSubKeterangan('SIAP OPS');
      setStatusDinas('HADIR');
      setCatatan('');
    }
  }, [personnelToEdit, isOpen, patentCategories]);

  if (!isOpen) return null;

  const handleSubKeteranganChange = (val: string) => {
    setSubKeterangan(val);
    const inferred = inferCategoryAndStatus(val, kategoriSaatIni);
    setKategoriSaatIni(inferred.category);
    setStatusDinas(inferred.status);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const rankLevel = getRankLevel(pangkat);
    const newPerson: Personnel = {
      id: personnelToEdit ? personnelToEdit.id : Date.now(),
      pangkat: pangkat.trim(),
      nama: nama.trim(),
      pangkat_level: rankLevel,
      keterangan_paten: keteranganPaten,
      kategori_saat_ini: kategoriSaatIni,
      sub_keterangan_saat_ini: subKeterangan.trim(),
      status_dinas: statusDinas,
      catatan: catatan.trim(),
      isCustom: true,
    };

    onSave(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {personnelToEdit ? 'Edit Data Personel' : 'Tambah Total Paten (Personel Baru)'}
              </h3>
              <p className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                YONIF TP 942/ARYA WANGSAKARA • Kompi Markas
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Pangkat & Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pangkat * <span className="text-[10px] text-amber-400 font-mono">(Ketik Sendiri)</span>
              </label>
              <input
                type="text"
                required
                value={pangkat}
                onChange={(e) => setPangkat(e.target.value)}
                placeholder="Contoh: Letda Inf, Serka, Prada"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Personel *
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Yoga Tri K"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Row 2: Keterangan Paten (Organik) - Hanya Admin */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Keterangan Paten / Organik *{' '}
              {isAdmin ? (
                <span className="text-[10px] text-emerald-400 font-mono">(Ketik / Pilih Bebas)</span>
              ) : (
                <span className="text-[10px] text-amber-400 font-mono">(Terkunci: Khusus Admin)</span>
              )}
            </label>
            <div className="space-y-1.5">
              {isAdmin && (
                <select
                  aria-label="Pilih cepat keterangan paten"
                  value={
                    syncedPresets.some((p) => p.subKet === keteranganPaten.toUpperCase())
                      ? keteranganPaten.toUpperCase()
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) setKeteranganPaten(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value="">-- Pilih cepat dari Daftar Apel / Paten --</option>
                  {syncedPresets
                    .filter((p) => p.subKet !== 'KOSONG' && p.subKet !== 'TMMD')
                    .map((p) => (
                      <option key={p.subKet} value={p.subKet}>
                        {p.subKet}
                      </option>
                    ))}
                  <option value="LAIN LAIN">LAIN LAIN</option>
                </select>
              )}
              <input
                type="text"
                list="patent-options-list"
                required
                disabled={!isAdmin}
                value={keteranganPaten}
                onChange={(e) => setKeteranganPaten(e.target.value.toUpperCase())}
                placeholder="Ketik atau pilih: STAF INTEL, TON ANG, DAPUR, dll."
                className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-100 uppercase font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isAdmin
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              />
              <datalist id="patent-options-list">
                {syncedPresets
                  .filter((p) => p.subKet !== 'KOSONG' && p.subKet !== 'TMMD')
                  .map((p) => (
                    <option key={p.subKet} value={p.subKet} />
                  ))}
                {patentCategories
                  .filter((c) => c.trim().toUpperCase() !== 'TMMD')
                  .map((c) => (
                    <option key={`pat-${c}`} value={c} />
                  ))}
                <option value="LAIN LAIN" />
              </datalist>
            </div>
          </div>

          {/* Row 3: Sub Keterangan & Kategori Utama Saat Ini */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sub Keterangan Saat Ini *
              </label>
              <select
                aria-label="Pilih cepat sub keterangan apel"
                value={
                  syncedPresets.some((p) => p.subKet === subKeterangan.toUpperCase())
                    ? subKeterangan.toUpperCase()
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) handleSubKeteranganChange(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              >
                <option value="">-- Pilih cepat Keterangan Apel --</option>
                {syncedPresets
                  .filter((p) => p.subKet !== 'TMMD')
                  .map((p) => (
                    <option key={p.subKet} value={p.subKet}>
                      {p.subKet}
                    </option>
                  ))}
              </select>
              <input
                type="text"
                list="subket-modal-options-list"
                required
                value={subKeterangan}
                onChange={(e) => handleSubKeteranganChange(e.target.value)}
                placeholder="Contoh: SIAP OPS, PAM PALASARI, PIKET KOMPI"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="subket-modal-options-list">
                {syncedPresets
                  .filter((p) => p.subKet !== 'TMMD')
                  .map((p) => (
                    <option key={p.subKet} value={p.subKet} />
                  ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori Utama Saat Ini
              </label>
              <select
                value={kategoriSaatIni}
                onChange={(e) => setKategoriSaatIni(e.target.value as KategoriDinas)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Status Dinas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status Apel Dinas
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="radio"
                  name="status_dinas"
                  value="HADIR"
                  checked={statusDinas === 'HADIR'}
                  onChange={() => setStatusDinas('HADIR')}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-emerald-400 font-semibold">HADIR (Siap Ops)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="radio"
                  name="status_dinas"
                  value="KURANG"
                  checked={statusDinas === 'KURANG'}
                  onChange={() => setStatusDinas('KURANG')}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-amber-400 font-semibold">KURANG (Dinas/Ijin/Tugas)</span>
              </label>
            </div>
          </div>

          {/* Row 5: Catatan Khusus */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan / Keterangan Khusus
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Dik Komando, Supir Danyon, dll."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-700/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Simpan Personel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
