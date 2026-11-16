import { KategoriDinas } from '../types/personnel';
import { getRankCategory, inferCategoryAndStatus, getApelSubKetPriority } from './personnelLogic';

export function getShortRankCode(pangkat: string): string {
  const clean = (pangkat || '').trim().toUpperCase();
  if (!clean) return 'PRS';
  const firstWord = clean.split(/\s+/)[0];
  return firstWord.slice(0, 5);
}

export function getAvatarColorClasses(pangkat: string): string {
  const cat = getRankCategory(pangkat);
  switch (cat) {
    case 'PERWIRA':
      return 'bg-amber-500/20 text-amber-300 border border-amber-400/50';
    case 'BINTARA':
      return 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/50';
    case 'TAMTAMA':
      return 'bg-rose-600/25 text-rose-200 border border-rose-500/50';
    default:
      return 'bg-[#2a3942] text-[#e9edef] border border-[#3b4a54]';
  }
}

export function countActiveAdvancedFilters(params: {
  selectedRank: string;
  selectedSubKet: string;
}): number {
  let count = 0;
  if (params.selectedRank && params.selectedRank !== 'Semua') count++;
  if (params.selectedSubKet && params.selectedSubKet !== 'Semua') count++;
  return count;
}

export interface QuickPresetOption {
  label: string;
  subKet: string;
  category: KategoriDinas;
}

export const QUICK_APEL_PRESETS: QuickPresetOption[] = [
  { label: 'SIAP OPS', subKet: 'SIAP OPS', category: 'SIAP OPS' },
  { label: 'PIKET YON', subKet: 'PIKET YON', category: 'DINAS DALAM' },
  { label: 'PIKET KOMPI', subKet: 'PIKET KOMPI', category: 'DINAS DALAM' },
  { label: 'PIKET KOM', subKet: 'PIKET KOM', category: 'DINAS DALAM' },
  { label: 'SATRI', subKet: 'SATRI', category: 'DINAS DALAM' },
  { label: 'JAKAM', subKet: 'JAKAM', category: 'DINAS DALAM' },
  { label: 'PROVOOST', subKet: 'PROVOOST', category: 'DINAS DALAM' },
  { label: 'DAPUR', subKet: 'DAPUR', category: 'DINAS DALAM' },
  { label: 'KOPERASI', subKet: 'KOPERASI', category: 'DINAS DALAM' },
  { label: 'KORVE KOREM', subKet: 'KORVE KOREM', category: 'DINAS LUAR' },
  { label: 'DIK/SUS/TAR', subKet: 'DIK/SUS/TAR', category: 'DINAS KHUSUS' },
  { label: 'BIMTEK WABKU', subKet: 'BIMTEK WABKU', category: 'DINAS KHUSUS' },
  { label: 'BP KOTAS', subKet: 'BP KOTAS', category: 'DINAS KHUSUS' },
  { label: 'KOSONG', subKet: 'KOSONG', category: 'LAIN LAIN' },
];

function normalizePresetKey(value: string): string {
  const upper = value.trim().toUpperCase();
  if (upper === 'PROVOST') return 'PROVOOST';
  if (upper === 'DIK SUS/TAR' || upper === 'DIK/SUS/TAR') return 'DIK/SUS/TAR';
  return upper;
}

/**
 * Produces a single synchronized preset list driven strictly by:
 * - Keterangan Paten Organik (patentCategories)
 * - Sub Keterangan Apel (subKetList)
 * Always excludes legacy TMMD entries, keeps SIAP OPS first, sorts middle options
 * according to APEL_SUB_KET_ORDER, and keeps KOSONG last.
 */
export function buildSyncedApelOptions(
  subKetList: string[] = [],
  patentCategories: string[] = []
): QuickPresetOption[] {
  const map = new Map<string, QuickPresetOption>();

  const register = (rawLabel: string, rawSubKet: string, explicitCategory?: KategoriDinas) => {
    const cleanSub = normalizePresetKey(rawSubKet);
    if (!cleanSub || cleanSub === 'TMMD') return;
    if (map.has(cleanSub)) return;

    const category = explicitCategory ?? inferCategoryAndStatus(cleanSub).category;
    map.set(cleanSub, {
      label: normalizePresetKey(rawLabel),
      subKet: cleanSub,
      category,
    });
  };

  // 1. Collect all user/admin-managed Keterangan Paten Organik & Sub Keterangan Apel
  patentCategories.forEach((item) => {
    const norm = item ? normalizePresetKey(item) : '';
    if (norm && norm !== 'SIAP OPS' && norm !== 'KOSONG') {
      register(item, item);
    }
  });

  subKetList.forEach((item) => {
    const norm = item ? normalizePresetKey(item) : '';
    if (norm && norm !== 'SIAP OPS' && norm !== 'KOSONG') {
      register(item, item);
    }
  });

  // 2. Sort middle options strictly by APEL_SUB_KET_ORDER priority
  const middleOptions = Array.from(map.values()).sort((a, b) => {
    return (
      getApelSubKetPriority(a.subKet, a.category, 'KURANG') -
      getApelSubKetPriority(b.subKet, b.category, 'KURANG')
    );
  });

  // 3. Return with SIAP OPS first and KOSONG last
  return [
    { label: 'SIAP OPS', subKet: 'SIAP OPS', category: 'SIAP OPS' },
    ...middleOptions,
    { label: 'KOSONG', subKet: 'KOSONG', category: 'LAIN LAIN' },
  ];
}

