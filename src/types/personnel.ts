export type Pangkat = 'Letda' | 'Serka' | 'Sertu' | 'Serda' | 'Praka' | 'Pratu' | 'Prada' | string;

export type KategoriDinas = 'DINAS DALAM' | 'DINAS LUAR' | 'DINAS KHUSUS' | 'LAIN LAIN' | 'SIAP OPS';

export type StatusDinas = 'HADIR' | 'KURANG';

export interface Personnel {
  id: number;
  pangkat: string;
  nama: string;
  pangkat_level: number;
  keterangan_paten: string;
  kategori_saat_ini: KategoriDinas;
  sub_keterangan_saat_ini: string;
  status_dinas: StatusDinas;
  catatan?: string;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DuplicateReport {
  nama: string;
  posisi_tercatat: string[];
  catatan: string;
  matchingIds?: number[];
}

export interface MusterSummary {
  total: number;
  kurang: number;
  hadir: number;
  duplicates: DuplicateReport[];
  kategoriBreakdown: Record<KategoriDinas, number>;
  unaccountedCount: number;
}

export type ActionChangeType =
  | 'UBAH_KATEGORI'
  | 'UBAH_STATUS'
  | 'UBAH_SUB_KETERANGAN'
  | 'UBAH_CATATAN'
  | 'RESET_PATEN'
  | 'UBAH_PATEN'
  | 'HAPUS_KURUNG'
  | 'EDIT_LENGKAP'
  | 'TAMBAH_BARU'
  | 'PERINTAH_CHATBOT'
  | 'RESOLUSI_DUPLIKAT';

export interface ChangeHistoryEntry {
  id: string;
  personnelId: number;
  personnelNama: string;
  personnelPangkat: string;
  actionType: ActionChangeType;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  perubah: string;
  timestamp: string;
  keteranganTambahan?: string;
}

export interface NlpCommandResult {
  action:
    | 'ASSIGN_SUB_KETERANGAN'
    | 'RESET_ALL_TO_PATEN'
    | 'FILTER_BY_RANK'
    | 'FILTER_BY_CATEGORY'
    | 'RUN_AUDIT'
    | 'CHECK_DUPLICATES'
    | 'CHECK_KURANG'
    | 'CHECK_DUPLICATES_AND_KURANG'
    | 'CHECK_MUSTER_TEXT'
    | 'UNKNOWN'
    | 'REPORT_EXPORT';
  success: boolean;
  message: string;
  affectedCount?: number;
  data?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actionExecuted?: string;
  details?: string;
}
