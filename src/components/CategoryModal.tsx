import React, { useState } from 'react';
import { X, FolderPlus, Check, Trash2, Edit2, Shield, Layers, Plus, Tag } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (newCategory: string) => void;
  onEditCategory?: (oldCategory: string, newCategory: string) => void;
  onRemoveCategory?: (category: string) => void;
  subKetList?: string[];
  onAddSubKet?: (newSubKet: string) => void;
  onRemoveSubKet?: (subKet: string) => void;
  isAdmin?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onRemoveCategory,
  subKetList = [],
  onAddSubKet,
  onRemoveSubKet,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'paten' | 'subket'>('paten');

  // Patent state
  const [newCat, setNewCat] = useState<string>('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Sub-ket state
  const [newSubKet, setNewSubKet] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmitNewCat = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCat.trim().toUpperCase();
    if (!trimmed || categories.includes(trimmed)) return;
    onAddCategory(trimmed);
    setNewCat('');
  };

  const handleStartEdit = (cat: string) => {
    setEditingCat(cat);
    setEditValue(cat);
  };

  const handleSaveEdit = (oldCat: string) => {
    const trimmed = editValue.trim().toUpperCase();
    if (trimmed && trimmed !== oldCat && onEditCategory) {
      onEditCategory(oldCat, trimmed);
    }
    setEditingCat(null);
    setEditValue('');
  };

  const handleSubmitNewSubKet = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubKet.trim().toUpperCase();
    if (!trimmed || subKetList.includes(trimmed)) return;
    if (onAddSubKet) {
      onAddSubKet(trimmed);
    }
    setNewSubKet('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kelola Keterangan Paten & Sub Keterangan</h3>
              <p className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                Tersinkron otomatis dengan Ubah Keterangan Apel
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('paten')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paten'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Keterangan Paten Organik ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subket')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'subket'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Sub Keterangan Apel ({subKetList.length})</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* TAB 1: Keterangan Paten (Admin Only for Edit/Add) */}
          {activeTab === 'paten' && (
            <div className="space-y-4">
              {!isAdmin && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Mode Baca (User): Hanya Administrator Utama & Admin yang berhak menambah, mengubah, atau menghapus Keterangan Paten Organik.</span>
                </div>
              )}

              {isAdmin && (
                <form onSubmit={handleSubmitNewCat} className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Tambah Keterangan Paten / Seksi Baru:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      placeholder="Contoh: TON PAL, SATUAN KAWAL, BP KOTAS"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
                    >
                      Tambah Paten
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Daftar Keterangan Paten ({categories.length}):
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {isAdmin ? 'Bisa diubah & dihapus (Admin)' : 'Mode Baca'}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {categories
                    .filter((cat) => cat.trim().toUpperCase() !== 'TMMD')
                    .map((cat) => {
                    const isEditing = editingCat === cat;

                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs text-slate-200"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEdit(cat);
                                } else if (e.key === 'Escape') {
                                  setEditingCat(null);
                                }
                              }}
                              className="px-2 py-1 bg-slate-900 border border-emerald-500 rounded text-xs text-white uppercase font-mono w-full"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCat(null)}
                              className="p-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono font-semibold text-slate-200">{cat}</span>
                        )}

                        {!isEditing && isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 rounded bg-slate-700/70 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                              title="Ubah nama"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onRemoveCategory && (
                              <button
                                type="button"
                                onClick={() => onRemoveCategory(cat)}
                                className="p-1.5 rounded bg-slate-700/70 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                                title="Hapus kategori paten ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sub Keterangan Apel */}
          {activeTab === 'subket' && (
            <div className="space-y-4">
              <form onSubmit={handleSubmitNewSubKet} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Tambah Sub Keterangan Apel Baru:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newSubKet}
                    onChange={(e) => setNewSubKet(e.target.value)}
                    placeholder="Contoh: PIKET YON, KORVE GUDANG, PATROLI"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
                  >
                    Tambah Sub Ket
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Daftar Sub Keterangan ({subKetList.length}):
                  </h4>
                  <span className="text-[11px] text-slate-500">Dapat ditambah & dihapus</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {subKetList
                    .filter((sk) => sk.trim().toUpperCase() !== 'TMMD')
                    .map((sk) => (
                    <div
                      key={sk}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs text-slate-200"
                    >
                      <span className="font-mono font-semibold text-slate-200">{sk}</span>
                      {onRemoveSubKet && (
                        <button
                          type="button"
                          onClick={() => onRemoveSubKet(sk)}
                          className="p-1.5 rounded bg-slate-700/70 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Hapus sub keterangan ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
