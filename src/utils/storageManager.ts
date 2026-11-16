import { Personnel, ChangeHistoryEntry } from '../types/personnel';
import {
  INITIAL_PERSONNEL_DATABASE,
  INITIAL_KETERANGAN_PATEN_LIST,
} from '../data/initialData';
import { INITIAL_CHANGE_HISTORY } from './historyManager';

const STORAGE_KEY_PERSONNEL = 'KIMA_PERSONNEL_MASTER_DB_V3';
const STORAGE_KEY_PATENT_CATEGORIES = 'KIMA_PATENT_CATEGORIES_V3';
const STORAGE_KEY_SUB_KET_LIST = 'KIMA_SUB_KET_LIST_V3';
const STORAGE_KEY_HISTORY = 'KIMA_CHANGE_HISTORY_V3';

export const INITIAL_SUB_KET_LIST: string[] = [
  // DINAS DALAM
  'PIKET YON',
  'PIKET KOMPI',
  'PIKET KOM',
  'SATRI',
  'JAKAM',
  'PROVOOST',
  'DAPUR',
  'KOPERASI',
  'TURUN SATRI',
  // DINAS LUAR
  'KORVE KOREM',
  'PAM PALASARI',
  // DINAS KHUSUS
  'DIK/SUS/TAR',
  'BIMTEK WABKU',
  'BP KOTAS',
  // LAIN LAIN
  'STAF INTEL',
  'STAF OPS',
  'STAF PERS',
  'STAF LOG',
  'TON ANG',
  'CARAKA',
  'JUYAR',
  'ADC',
  'TURUN PAM PALASARI',
  'PERSIAPAN NAIK PIKET YON',
  'PERSIAPAN NAIK PIKET KOMPI',
  // SIAP OPS
  'SIAP OPS',
];

export function loadPersonnelFromStorage(): Personnel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERSONNEL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => {
          const patenUpper = (p.keterangan_paten || '').trim().toUpperCase();
          if (patenUpper === 'PROVOST' || patenUpper === 'PROVOOST') {
            return {
              ...p,
              keterangan_paten: 'PROVOOST',
              kategori_saat_ini: p.kategori_saat_ini === 'SIAP OPS' ? 'SIAP OPS' : 'DINAS DALAM',
            };
          }
          if (patenUpper === 'BP KOMANDO ATAS') {
            return {
              ...p,
              keterangan_paten: 'BP KOTAS',
            };
          }
          return p;
        });
      }
    }
  } catch (err) {
    console.error('Failed to load personnel from storage:', err);
  }
  // Initialize with initial database stamped with initial timestamps
  const initialStamped = INITIAL_PERSONNEL_DATABASE.map((p) => ({
    ...p,
    createdAt: p.createdAt || '2026-11-01T06:00:00.000Z',
    updatedAt: p.updatedAt || '2026-11-01T06:00:00.000Z',
  }));
  savePersonnelToStorage(initialStamped);
  return initialStamped;
}

export function savePersonnelToStorage(list: Personnel[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERSONNEL, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save personnel to storage:', err);
  }
}

export function loadPatentCategoriesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PATENT_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item) => String(item).trim().toUpperCase() !== 'TMMD');
      }
    }
  } catch (err) {
    console.error('Failed to load patent categories from storage:', err);
  }
  savePatentCategoriesToStorage(INITIAL_KETERANGAN_PATEN_LIST);
  return INITIAL_KETERANGAN_PATEN_LIST;
}

export function savePatentCategoriesToStorage(list: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PATENT_CATEGORIES, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save patent categories to storage:', err);
  }
}

export function loadSubKetListFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUB_KET_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item) => String(item).trim().toUpperCase() !== 'TMMD');
      }
    }
  } catch (err) {
    console.error('Failed to load sub ket list from storage:', err);
  }
  saveSubKetListToStorage(INITIAL_SUB_KET_LIST);
  return INITIAL_SUB_KET_LIST;
}

export function saveSubKetListToStorage(list: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUB_KET_LIST, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save sub ket list to storage:', err);
  }
}

export function loadHistoryFromStorage(): ChangeHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load history from storage:', err);
  }
  saveHistoryToStorage(INITIAL_CHANGE_HISTORY);
  return INITIAL_CHANGE_HISTORY;
}

export function saveHistoryToStorage(list: ChangeHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save history to storage:', err);
  }
}

export function resetAllStorageToDefault(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PERSONNEL);
    localStorage.removeItem(STORAGE_KEY_PATENT_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_SUB_KET_LIST);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
}
