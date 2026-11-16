import {
  Personnel,
  KategoriDinas,
  StatusDinas,
  MusterSummary,
  DuplicateReport,
  NlpCommandResult,
} from '../types/personnel';
import { INITIAL_RANK_ORDER } from '../data/initialData';

export function getRankCategory(pangkat: string): 'PERWIRA' | 'BINTARA' | 'TAMTAMA' | 'LAINNYA' {
  const p = pangkat.trim().toLowerCase();
  // Perwira: Letda, Lettu, Kapten, Mayor, Letkol, Kolonel, dll.
  if (
    p.startsWith('letda') ||
    p.startsWith('lettu') ||
    p.startsWith('kapten') ||
    p.startsWith('kapt') ||
    p.startsWith('mayor') ||
    p.startsWith('may') ||
    p.startsWith('letkol') ||
    p.startsWith('kolonel') ||
    p.startsWith('kol') ||
    p.includes('perwira')
  ) {
    return 'PERWIRA';
  }

  // Bintara: Serka, Serma, Pelda, Peltu, Sertu, Serda, dll.
  if (
    p.startsWith('serka') ||
    p.startsWith('serma') ||
    p.startsWith('pelda') ||
    p.startsWith('peltu') ||
    p.startsWith('sertu') ||
    p.startsWith('serda') ||
    p.includes('bintara')
  ) {
    return 'BINTARA';
  }

  // Tamtama: Kopka, Koptu, Kopda, Praka, Pratu, Prada, dll.
  if (
    p.startsWith('kopka') ||
    p.startsWith('koptu') ||
    p.startsWith('kopda') ||
    p.startsWith('praka') ||
    p.startsWith('pratu') ||
    p.startsWith('prada') ||
    p.includes('tamtama')
  ) {
    return 'TAMTAMA';
  }

  return 'LAINNYA';
}

/**
 * Exact color styling based on user instruction:
 * Perwira: Kuning Keemasan
 * Bintara: Kuning Cerah
 * Tamtama: Merah Cabe
 */
export function getRankBadgeStyle(pangkat: string): string {
  const cat = getRankCategory(pangkat);
  switch (cat) {
    case 'PERWIRA':
      // Kuning Keemasan (Golden Yellow)
      return 'bg-amber-100 text-amber-950 border border-amber-400 font-extrabold shadow-xs';
    case 'BINTARA':
      // Kuning Cerah (Bright Yellow)
      return 'bg-yellow-200 text-yellow-950 border border-yellow-500 font-extrabold shadow-xs';
    case 'TAMTAMA':
      // Merah Cabe (Chili Red)
      return 'bg-red-600 text-white border border-red-700 font-extrabold shadow-xs';
    default:
      return 'bg-slate-200 text-slate-800 border border-slate-400 font-bold';
  }
}

/**
 * Move row from one index to another, reordering the list
 */
export function movePersonnelRow(list: Personnel[], fromIndex: number, toIndex: number): Personnel[] {
  if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) {
    return list;
  }
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function getRankLevel(pangkat: string): number {
  const clean = pangkat.trim().toLowerCase();
  for (const item of INITIAL_RANK_ORDER) {
    if (clean.startsWith(item.pangkat.toLowerCase())) {
      return item.tingkat;
    }
  }
  // If rank starts with officer ranks
  if (clean.startsWith('lettu')) return 1;
  if (clean.startsWith('kapten')) return 1;
  if (clean.startsWith('mayor')) return 1;
  if (clean.startsWith('kop')) return 5;
  return 99; // unknown/cadangan
}

/**
 * Removes parentheses '(' and ')' from strings and normalizes spacing.
 */
export function cleanParentheses(text: string): string {
  if (!text) return text;
  return text.replace(/[()]/g, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Strips parentheses from personnel names, notes/catatan, and keterangan.
 */
export function stripParenthesesFromPersonnel(
  list: Personnel[],
  options: { cleanNames?: boolean; cleanRemarks?: boolean; cleanSubKet?: boolean } = {
    cleanNames: true,
    cleanRemarks: true,
    cleanSubKet: true,
  }
): { updatedList: Personnel[]; modifiedCount: number } {
  let count = 0;
  const updatedList = list.map((p) => {
    let modified = false;
    let newNama = p.nama;
    let newCatatan = p.catatan || '';
    let newSubKet = p.sub_keterangan_saat_ini;
    let newPaten = p.keterangan_paten;

    if (options.cleanNames && (newNama.includes('(') || newNama.includes(')'))) {
      newNama = cleanParentheses(newNama);
      modified = true;
    }

    if (options.cleanRemarks && (newCatatan.includes('(') || newCatatan.includes(')'))) {
      newCatatan = cleanParentheses(newCatatan);
      modified = true;
    }

    if (options.cleanSubKet && (newSubKet.includes('(') || newSubKet.includes(')'))) {
      newSubKet = cleanParentheses(newSubKet);
      modified = true;
    }

    if (modified) {
      count++;
      return {
        ...p,
        nama: newNama,
        catatan: newCatatan,
        sub_keterangan_saat_ini: newSubKet,
        keterangan_paten: newPaten,
      };
    }
    return p;
  });

  return { updatedList, modifiedCount: count };
}

export function comparePersonnelByRankAndName(a: Personnel, b: Personnel): number {
  const rankDiff = a.pangkat_level - b.pangkat_level;
  if (rankDiff !== 0) return rankDiff;
  return a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' });
}

export function sortPersonnel(list: Personnel[]): Personnel[] {
  return [...list].sort(comparePersonnelByRankAndName);
}

export const APEL_SUB_KET_ORDER: string[] = [
  // DINAS DALAM
  'PIKET YON',
  'PIKET KOMPI',
  'PIKET KOM',
  'SATRI',
  'JAKAM',
  'PROVOOST',
  'DAPUR',
  'KOPERASI',
  // DINAS LUAR
  'KORVE KOREM',
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
];

export function isSiapOps(subKet: string, kategori?: string, status?: string): boolean {
  const cleanSub = (subKet || '').trim().toUpperCase();
  const cleanCat = (kategori || '').trim().toUpperCase();
  const cleanStat = (status || '').trim().toUpperCase();

  return (
    cleanSub === 'SIAP OPS' ||
    cleanSub === 'SIAPOPS' ||
    cleanSub.startsWith('SIAP') ||
    cleanCat === 'SIAP OPS' ||
    cleanCat === 'SIAPOPS' ||
    cleanStat === 'HADIR'
  );
}

export function getApelSubKetPriority(subKet: string, kategori?: string, status?: string): number {
  // SIAPOPS / HADIR is strictly anchored at the very bottom
  if (isSiapOps(subKet, kategori, status)) {
    return 1000;
  }

  const clean = (subKet || '').trim().toUpperCase();
  const normalized = clean.replace(/[\s\-_/.]/g, '');

  for (let i = 0; i < APEL_SUB_KET_ORDER.length; i++) {
    const target = APEL_SUB_KET_ORDER[i];
    const targetNormalized = target.replace(/[\s\-_/.]/g, '');

    // Exact match or normalized match
    if (clean === target || normalized === targetNormalized) {
      return i;
    }

    // PROVOOST matches PROVOST and PROV
    if (target === 'PROVOOST' && (clean === 'PROVOST' || clean.startsWith('PROV'))) {
      return i;
    }

    // DIK/SUS/TAR matches variants like DIK SUS/TAR, DIK, KURSUS, PENATARAN
    if ((target === 'DIK/SUS/TAR' || target === 'DIK SUS/TAR') && (clean === 'DIK/SUS/TAR' || clean === 'DIK SUS/TAR' || clean.startsWith('DIK') || clean.includes('KURSUS') || clean.includes('PENATARAN'))) {
      return i;
    }

    // BP KOTAS matches BP KOMANDO ATAS, KOTAS, KOMANDO ATAS
    if (target === 'BP KOTAS' && (clean === 'BP KOMANDO ATAS' || clean.includes('KOTAS') || clean.includes('KOMANDO ATAS'))) {
      return i;
    }

    // Multi-word prefix
    if (clean.startsWith(target + ' ')) {
      return i;
    }
  }

  // Sub keterangan lain mengikuti KATEGORI UTAMA sehingga rapih:
  // DINAS DALAM items end at index 7 (KOPERASI) -> other DINAS DALAM placed at 7.5
  // DINAS LUAR items end at index 8 (KORVE KOREM) -> other DINAS LUAR placed at 8.5
  // DINAS KHUSUS items end at index 11 (BP KOTAS) -> other DINAS KHUSUS placed at 11.5
  // LAIN LAIN items end at index 22 (PERSIAPAN NAIK PIKET KOMPI) -> other LAIN LAIN placed at 22.5
  const cleanCat = (kategori || '').trim().toUpperCase();
  if (cleanCat === 'DINAS DALAM') {
    return 7.5;
  }
  if (cleanCat === 'DINAS LUAR') {
    return 8.5;
  }
  if (cleanCat === 'DINAS KHUSUS') {
    return 11.5;
  }
  if (cleanCat === 'LAIN LAIN' || cleanCat === 'LAIN-LAIN') {
    return 22.5;
  }

  // Other sub-keterangan follow below the main duty categories, but above SIAP OPS
  return 23;
}

export function sortPersonnelByKeteranganApel(list: Personnel[]): Personnel[] {
  return [...list].sort((a, b) => {
    const priorityA = getApelSubKetPriority(a.sub_keterangan_saat_ini, a.kategori_saat_ini, a.status_dinas);
    const priorityB = getApelSubKetPriority(b.sub_keterangan_saat_ini, b.kategori_saat_ini, b.status_dinas);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If both are custom/other sub-keterangan (priority 500)
    if (priorityA === 500 && priorityB === 500) {
      const subComp = a.sub_keterangan_saat_ini.localeCompare(b.sub_keterangan_saat_ini, 'id', { sensitivity: 'base' });
      if (subComp !== 0) {
        // Sort by date created or updated (newest first)
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        return subComp;
      }
    }

    // Within same sub-keterangan group, strictly sort by military rank (Letda -> Prada) then name
    const rankDiff = a.pangkat_level - b.pangkat_level;
    if (rankDiff !== 0) return rankDiff;

    return a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' });
  });
}

/**
 * Intelligent categorization and status inference:
 * If sub_keterangan is 'SIAP OPS', status is 'HADIR' and category is 'SIAP OPS'.
 * Otherwise, if DINAS DALAM, DINAS LUAR, DINAS KHUSUS, or LAIN LAIN, status is 'KURANG'.
 */
export function inferCategoryAndStatus(
  subKeterangan: string,
  existingCategory?: KategoriDinas
): { category: KategoriDinas; status: StatusDinas } {
  const upper = subKeterangan.trim().toUpperCase();

  if (upper === 'SIAP OPS' || upper === 'HADIR' || upper.startsWith('SIAP')) {
    return { category: 'SIAP OPS', status: 'HADIR' };
  }

  // Known DINAS DALAM keywords
  const dinasDalamKeywords = [
    'PIKET YON',
    'PIKET KOMPI',
    'PIKET KOM',
    'PIKET',
    'SATRI',
    'PROVOOST',
    'PROVOST',
    'PROV',
    'JAKAM',
    'DAPUR',
    'KOPERASI',
    'JAGA',
  ];
  if (dinasDalamKeywords.some((k) => upper.includes(k))) {
    return { category: 'DINAS DALAM', status: 'KURANG' };
  }

  // Known DINAS KHUSUS keywords (check before generic keywords)
  const dinasKhususKeywords = [
    'BIMTEK',
    'WABKU',
    'DIK/SUS/TAR',
    'DIK SUS/TAR',
    'DIK',
    'KURSUS',
    'PENATARAN',
    'KOMANDO',
    'BP KOTAS',
    'KOTAS',
    'BDM',
    'JIUJITSU',
  ];
  if (dinasKhususKeywords.some((k) => upper.includes(k))) {
    return { category: 'DINAS KHUSUS', status: 'KURANG' };
  }

  // Check TURUN PAM PALASARI explicitly as LAIN LAIN before general PAM
  if (upper.includes('TURUN PAM')) {
    return { category: 'LAIN LAIN', status: 'KURANG' };
  }

  // Known DINAS LUAR keywords
  const dinasLuarKeywords = [
    'PAM PALASARI',
    'PALASARI',
    'KORVE KOREM',
    'KORVE',
    'TMMD',
    'BKO',
    'PATROLI',
    'PENGAMANAN',
  ];
  if (dinasLuarKeywords.some((k) => upper.includes(k))) {
    return { category: 'DINAS LUAR', status: 'KURANG' };
  }

  // Fallback to existing or LAIN LAIN
  return {
    category: existingCategory && existingCategory !== 'SIAP OPS' ? existingCategory : 'LAIN LAIN',
    status: 'KURANG',
  };
}

/**
 * Calculates muster statistics: Total, Kurang, Hadir, category breakdown, and duplicates.
 */
export function calculateMusterSummary(list: Personnel[]): MusterSummary {
  let hadir = 0;
  let kurang = 0;
  const kategoriBreakdown: Record<KategoriDinas, number> = {
    'DINAS DALAM': 0,
    'DINAS LUAR': 0,
    'DINAS KHUSUS': 0,
    'LAIN LAIN': 0,
    'SIAP OPS': 0,
  };

  list.forEach((p) => {
    if (p.status_dinas === 'HADIR' || p.kategori_saat_ini === 'SIAP OPS') {
      hadir++;
    } else {
      kurang++;
    }

    if (kategoriBreakdown[p.kategori_saat_ini] !== undefined) {
      kategoriBreakdown[p.kategori_saat_ini]++;
    } else {
      kategoriBreakdown['LAIN LAIN']++;
    }
  });

  // Real-time duplicate inspection
  const duplicates: DuplicateReport[] = [];
  const nameMap = new Map<string, Personnel[]>();

  list.forEach((p) => {
    // Normalise name (ignore "Alokasi Cadangan" or generic slots)
    const normalized = p.nama.trim().toLowerCase();
    if (
      normalized.includes('cadangan') ||
      normalized.includes('tambahan') ||
      normalized === ''
    ) {
      return;
    }
    const arr = nameMap.get(normalized) || [];
    arr.push(p);
    nameMap.set(normalized, arr);
  });

  nameMap.forEach((matched, nameKey) => {
    if (matched.length > 1) {
      const positions = matched.map((m) => `${m.kategori_saat_ini} -> ${m.sub_keterangan_saat_ini}`);
      duplicates.push({
        nama: `${matched[0].pangkat} ${matched[0].nama}`,
        posisi_tercatat: positions,
        catatan: `Nama tercatat ganda pada ${positions.join(' dan ')}`,
        matchingIds: matched.map((m) => m.id),
      });
    }
  });

  // Check specific preset duplicates noted in initial brief
  list.forEach((p) => {
    if (p.catatan && p.catatan.includes('Duplikat tercatat') && !duplicates.some((d) => d.nama.includes(p.nama))) {
      duplicates.push({
        nama: `${p.pangkat} ${p.nama}`,
        posisi_tercatat: [
          `${p.kategori_saat_ini} -> ${p.sub_keterangan_saat_ini}`,
          p.catatan.includes('STAF PERS') ? 'STAF PERS' : 'PAM PALASARI',
        ],
        catatan: p.catatan,
        matchingIds: [p.id],
      });
    }
  });

  const unaccounted = list.filter(
    (p) => !p.sub_keterangan_saat_ini || p.sub_keterangan_saat_ini.trim() === ''
  ).length;

  return {
    total: list.length,
    kurang,
    hadir,
    duplicates,
    kategoriBreakdown,
    unaccountedCount: unaccounted,
  };
}

/**
 * Detailed duplicate personnel audit report generator.
 */
export function generateDuplicatesReport(list: Personnel[]): {
  message: string;
  duplicates: DuplicateReport[];
  count: number;
} {
  const summary = calculateMusterSummary(list);
  const duplicates = summary.duplicates;

  if (duplicates.length === 0) {
    return {
      message: `✅ PEMERIKSAAN DATA PERSONEL GANDA:\n\nTidak ditemukan data personel ganda! Seluruh ${list.length} personel Kompi Markas tercatat unik dan memiliki penugasan tunggal yang sah.`,
      duplicates: [],
      count: 0,
    };
  }

  const listText = duplicates
    .map(
      (d, i) =>
        `${i + 1}. ${d.nama}\n   • Posisi Tercatat: ${d.posisi_tercatat.join(' vs ')}\n   • Catatan Audit: ${d.catatan || 'Terdaftar ganda pada dua bagian sekaligus'}`
    )
    .join('\n\n');

  return {
    message: `⚠️ PEMERIKSAAN DATA PERSONEL GANDA:\n\nDitemukan ${duplicates.length} personel tercatat ganda / konflik penugasan:\n\n${listText}\n\n💡 Petunjuk: Anda dapat memilih posisi definitif menggunakan tombol "Pilih Posisi" / "Selesaikan Otomatis" pada kartu audit di atas atau ketik perintah pemindahan pos.`,
    duplicates,
    count: duplicates.length,
  };
}

/**
 * Detailed kurang (non-hadir/berdinas) personnel audit report generator.
 */
export function generateKurangReport(list: Personnel[]): {
  message: string;
  kurangList: Personnel[];
  count: number;
} {
  const summary = calculateMusterSummary(list);
  const kurangList = list.filter((p) => p.status_dinas === 'KURANG' || p.kategori_saat_ini !== 'SIAP OPS');
  const total = list.length;
  const persentase = total > 0 ? ((kurangList.length / total) * 100).toFixed(0) : '0';

  const categories: { cat: KategoriDinas; label: string; icon: string }[] = [
    { cat: 'DINAS DALAM', label: 'Dinas Dalam', icon: '🏢' },
    { cat: 'DINAS LUAR', label: 'Dinas Luar', icon: '🚗' },
    { cat: 'DINAS KHUSUS', label: 'Dinas Khusus', icon: '🎖️' },
    { cat: 'LAIN LAIN', label: 'Lain-lain', icon: '📋' },
  ];

  const breakdownLines: string[] = [];

  categories.forEach(({ cat, label, icon }) => {
    const group = kurangList.filter((p) => p.kategori_saat_ini === cat);
    if (group.length > 0) {
      const bySub: Record<string, string[]> = {};
      group.forEach((p) => {
        const sub = p.sub_keterangan_saat_ini || 'KOSONG';
        if (!bySub[sub]) bySub[sub] = [];
        bySub[sub].push(`${p.pangkat} ${p.nama}`);
      });

      const subBreakdown = Object.entries(bySub)
        .map(([sub, names]) => `   ▫️ ${sub} (${names.length} org): ${names.join(', ')}`)
        .join('\n');

      breakdownLines.push(`${icon} ${label.toUpperCase()} (${group.length} Orang):\n${subBreakdown}`);
    }
  });

  return {
    message: `📉 HASIL PEMERIKSAAN PERSONEL KURANG:\nJumlah Personel Kurang: ${kurangList.length} dari total ${total} Orang (${persentase}%)\n\n${breakdownLines.join('\n\n')}\n\n📊 Kesiapan Apel:\n• Hadir (Siap Ops): ${summary.hadir} Orang\n• Kurang Berdinas: ${kurangList.length} Orang`,
    kurangList,
    count: kurangList.length,
  };
}

/**
 * Combined audit report for both duplicate and kurang personnel.
 */
export function generateDuplicatesAndKurangReport(list: Personnel[]): {
  message: string;
  duplicateCount: number;
  kurangCount: number;
  duplicates: DuplicateReport[];
  kurangList: Personnel[];
} {
  const dupReport = generateDuplicatesReport(list);
  const kurangReport = generateKurangReport(list);

  const header = `🛡️ AUDIT PERSONEL KOMPI MARKAS - YONIF TP 942/AW\n(Pemeriksaan Data Ganda & Kurang Apel)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  const message = `${header}\n\n${dupReport.message}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${kurangReport.message}`;

  return {
    message,
    duplicateCount: dupReport.count,
    kurangCount: kurangReport.count,
    duplicates: dupReport.duplicates,
    kurangList: kurangReport.kurangList,
  };
}

/**
 * Resets all personnel currently in non-patent status back to their Keterangan Paten.
 */
export function resetAllToPaten(list: Personnel[]): Personnel[] {
  return list.map((p) => {
    const paten = p.keterangan_paten.trim().toUpperCase();
    if (paten === 'SIAP OPS') {
      return {
        ...p,
        kategori_saat_ini: 'SIAP OPS',
        sub_keterangan_saat_ini: 'SIAP OPS',
        status_dinas: 'HADIR',
      };
    }

    const { category, status } = inferCategoryAndStatus(p.keterangan_paten);
    return {
      ...p,
      kategori_saat_ini: category,
      sub_keterangan_saat_ini: p.keterangan_paten,
      status_dinas: status,
    };
  });
}

/**
 * Helper to match personnel names flexibly:
 * e.g. "Prada Rival" or "Rival", "Serda Zulfi" or "Zulfi"
 */
export function findPersonnelMatch(query: string, list: Personnel[]): Personnel[] {
  const q = query.trim().toLowerCase();
  // exact name
  const exact = list.filter((p) => p.nama.toLowerCase() === q);
  if (exact.length > 0) return exact;

  // full title + name
  const full = list.filter((p) => `${p.pangkat} ${p.nama}`.toLowerCase() === q);
  if (full.length > 0) return full;

  // query contains word parts
  const words = q.split(/\s+/).filter(Boolean);
  const subset = list.filter((p) => {
    const pFullName = `${p.pangkat} ${p.nama}`.toLowerCase();
    return words.every((w) => pFullName.includes(w));
  });

  if (subset.length > 0) return subset;

  // partial contains
  return list.filter((p) => p.nama.toLowerCase().includes(q));
}

/**
 * Interface for parsed personnel from muster roll WhatsApp message
 */
export interface ParsedMusterEntry {
  raw: string;
  rank: string;
  name: string;
  keterangan: string;
  matchedPerson?: Personnel;
}

/**
 * Extracts muster roll entities from WhatsApp message text.
 */
export function extractMusterEntities(textSection: string, dbList: Personnel[]): {
  entries: ParsedMusterEntry[];
  jumlahStated?: number;
  kurangStated?: number;
  hadirStated?: number;
} {
  const lines = textSection.split('\n').map((l) => l.trim()).filter(Boolean);
  const entries: ParsedMusterEntry[] = [];
  let currentKeterangan = 'SIAP OPS';

  let jumlahStated: number | undefined;
  let kurangStated: number | undefined;
  let hadirStated: number | undefined;

  const rankRegex = /^(?:letda\s+inf|letda\s+ckm|letda\s+cke|letda\s+cba|letda|lettu|kapten|mayor|letkol|kolonel|serka|serma|pelda|peltu|sertu|serda|kopka|koptu|kopda|praka|pratu|prada)\b/i;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check stated counts
    const jMatch = line.match(/(?:jumlah|jml)\s*[:=]\s*(\d+)/i);
    if (jMatch) jumlahStated = parseInt(jMatch[1], 10);

    const kMatch = line.match(/(?:kurang|krg)\s*[:=]\s*(\d+)/i);
    if (kMatch) kurangStated = parseInt(kMatch[1], 10);

    const hMatch = line.match(/(?:hadir|hdr)\s*[:=]\s*(\d+)/i);
    if (hMatch) hadirStated = parseInt(hMatch[1], 10);

    // Skip generic header lines
    if (
      lowerLine.startsWith('keterangan') ||
      lowerLine.startsWith('*keterangan') ||
      lowerLine.includes('data pembanding') ||
      lowerLine.includes('versi 1') ||
      lowerLine.includes('versi 2') ||
      lowerLine.includes('data 1') ||
      lowerLine.includes('data 2')
    ) {
      continue;
    }

    // Detect Category / Sub-Keterangan header
    // e.g. "🐯*DINAS DALAM = 14*", "1. DINAS KEAMANAN : 4 ORANG", "🐯*PAM PALASARI*", "SIAP OPS : 8"
    const isCategoryHeader =
      ((lowerLine.includes('dinas') ||
        lowerLine.includes('pam') ||
        lowerLine.includes('siap ops') ||
        lowerLine.includes('staf') ||
        lowerLine.includes('ton') ||
        lowerLine.includes('sakit') ||
        lowerLine.includes('cuti') ||
        lowerLine.includes('isoma') ||
        lowerLine.includes('kursus') ||
        lowerLine.includes('dik') ||
        lowerLine.includes('bp ') ||
        lowerLine.includes('ops') ||
        lowerLine.includes('kima') ||
        lowerLine.includes('yanrad') ||
        lowerLine.includes('provost') ||
        lowerLine.includes('regu')) &&
        (line.includes(':') || line.includes('=') || line.startsWith('*') || line.startsWith('🐯') || /^\d+\.\s+[A-Z\s]{3,}/.test(line))) ||
      /^[0-9]+[.)]\s+[A-Z\s/_-]{3,}(?:[:=]|\s*\d+\s*orang|$)/i.test(line);

    // Make sure category header isn't actually a single personnel row like "1. Prada Agus"
    const isPersonnelRow = /^[0-9\-•*.)\s]*(?:letda|serka|serma|pelda|peltu|sertu|serda|kopka|koptu|kopda|praka|pratu|prada)\b/i.test(line);

    if (isCategoryHeader && !isPersonnelRow) {
      // Clean category title
      let cat = line
        .replace(/[🐯*]/g, '')
        .replace(/^[0-9]+[.)]\s*/, '')
        .replace(/[:=].*$/, '')
        .replace(/\(\d+.*?\)/g, '')
        .trim();
      if (cat.length > 2) {
        currentKeterangan = cat.toUpperCase();
      }
      continue;
    }

    // Personnel line parsing
    // Strip leading numbers, bullets, dashes: "1. ", "- ", "• "
    const cleanedLine = line
      .replace(/^[0-9]+[.)]\s*/, '')
      .replace(/^[-•*–—]+\s*/, '')
      .replace(/[🐯*]/g, '')
      .trim();

    if (!cleanedLine) continue;

    // A line might have multiple names separated by comma or semicolon
    const segments = cleanedLine.split(/[,;]/).map((s) => s.trim()).filter(Boolean);

    for (const segment of segments) {
      const segClean = segment.replace(/^[0-9]+[.)]\s*/, '').trim();
      const rMatch = segClean.match(rankRegex);

      let detectedRank = '';
      let detectedName = segClean;

      if (rMatch) {
        detectedRank = rMatch[0];
        detectedName = segClean.substring(detectedRank.length).trim();
      }

      // Clean name from parentheses / notes: e.g. "Ryan (Sakit)" -> name: "Ryan"
      const cleanNameOnly = cleanParentheses(detectedName.replace(/\(.*?\)/g, '')).trim();

      if (!cleanNameOnly) continue;

      // Try matching with database: exact name match first to avoid partial collision
      const lowerClean = cleanNameOnly.toLowerCase();
      let matched = dbList.find((p) => p.nama.toLowerCase() === lowerClean);
      if (!matched && detectedRank) {
        matched = dbList.find(
          (p) => `${p.pangkat} ${p.nama}`.toLowerCase() === `${detectedRank} ${cleanNameOnly}`.toLowerCase()
        );
      }
      if (!matched) {
        matched = dbList.find((p) => {
          const pNama = p.nama.toLowerCase();
          if (pNama.includes(lowerClean) || lowerClean.includes(pNama)) {
            // If rank matches or is close
            if (detectedRank && p.pangkat.toLowerCase().includes(detectedRank.toLowerCase())) return true;
            if (lowerClean.length > 3) return true;
          }
          return false;
        });
      }

      if (matched) {
        entries.push({
          raw: segClean,
          rank: matched.pangkat,
          name: matched.nama,
          keterangan: currentKeterangan,
          matchedPerson: matched,
        });
      } else if (detectedRank || cleanNameOnly.split(' ').length >= 1) {
        // Unmatched person, but parsed as personnel
        entries.push({
          raw: segClean,
          rank: detectedRank || 'Personel',
          name: cleanNameOnly,
          keterangan: currentKeterangan,
        });
      }
    }
  }

  return { entries, jumlahStated, kurangStated, hadirStated };
}

/**
 * Analyzes WhatsApp roll call messages to detect:
 * 1. Personel Ganda (with keterangan location)
 * 2. Personel Kurang (with keterangan location)
 * 3. Personel Lebih (with keterangan location)
 * Supports comparing 2 pasted datasets OR comparing 1 pasted dataset against the company database.
 */
export function analyzeMusterTextComparison(
  text: string,
  currentList: Personnel[]
): {
  message: string;
  isDualDataset: boolean;
  ganda: { name: string; rank: string; keteranganList: string[] }[];
  kurang: { name: string; rank: string; keterangan: string }[];
  lebih: { name: string; rank: string; keterangan: string }[];
} {
  // Check if text has two distinct datasets
  // Delimiters: multiple "Jumlah:", multiple "Kurang:", or separator line "---", "Data 2", "Versi 2"
  const jumlahMatches = Array.from(text.matchAll(/jumlah\s*[:=]/gi));
  let isDual = false;
  let section1Text = text;
  let section2Text = '';

  if (jumlahMatches.length >= 2) {
    const secondIndex = jumlahMatches[1].index!;
    section1Text = text.substring(0, secondIndex).trim();
    section2Text = text.substring(secondIndex).trim();
    isDual = true;
  } else if (text.includes('---') || /data\s*2\s*[:=]/i.test(text) || /pembanding/i.test(text)) {
    const parts = text.split(/(?:---|==+|data\s*2\s*[:=]|pembanding)/i);
    if (parts.length >= 2 && parts[1].trim().length > 20) {
      section1Text = parts[0].trim();
      section2Text = parts[1].trim();
      isDual = true;
    }
  }

  const ds1 = extractMusterEntities(section1Text, currentList);
  const ds2 = isDual ? extractMusterEntities(section2Text, currentList) : null;

  const ganda: { name: string; rank: string; keteranganList: string[] }[] = [];
  const kurang: { name: string; rank: string; keterangan: string }[] = [];
  const lebih: { name: string; rank: string; keterangan: string }[] = [];

  if (isDual && ds2) {
    // COMPARISON BETWEEN 2 DATASETS
    // 1. Ganda: names appearing multiple times within Dataset 1 or Dataset 2 or both
    const map1 = new Map<string, ParsedMusterEntry[]>();
    for (const e of ds1.entries) {
      const key = e.matchedPerson ? String(e.matchedPerson.id) : e.name.toLowerCase();
      if (!map1.has(key)) map1.set(key, []);
      map1.get(key)!.push(e);
    }

    const map2 = new Map<string, ParsedMusterEntry[]>();
    for (const e of ds2.entries) {
      const key = e.matchedPerson ? String(e.matchedPerson.id) : e.name.toLowerCase();
      if (!map2.has(key)) map2.set(key, []);
      map2.get(key)!.push(e);
    }

    // Check intra-dataset duplicates
    map1.forEach((list) => {
      if (list.length > 1) {
        ganda.push({
          name: list[0].name,
          rank: list[0].rank,
          keteranganList: list.map((item) => `Data 1: ${item.keterangan}`),
        });
      }
    });

    map2.forEach((list) => {
      if (list.length > 1) {
        // check if already added
        const existing = ganda.find((g) => g.name.toLowerCase() === list[0].name.toLowerCase());
        if (existing) {
          existing.keteranganList.push(...list.map((item) => `Data 2: ${item.keterangan}`));
        } else {
          ganda.push({
            name: list[0].name,
            rank: list[0].rank,
            keteranganList: list.map((item) => `Data 2: ${item.keterangan}`),
          });
        }
      }
    });

    // 2. Kurang: Present in Data 1 but missing from Data 2
    map1.forEach((list1, key) => {
      if (!map2.has(key)) {
        kurang.push({
          name: list1[0].name,
          rank: list1[0].rank,
          keterangan: `Ada di Data 1 (${list1[0].keterangan}), namun TIDAK ADA di Data 2`,
        });
      }
    });

    // 3. Lebih: Present in Data 2 but missing from Data 1
    map2.forEach((list2, key) => {
      if (!map1.has(key)) {
        lebih.push({
          name: list2[0].name,
          rank: list2[0].rank,
          keterangan: `Ada di Data 2 (${list2[0].keterangan}), namun TIDAK ADA di Data 1`,
        });
      }
    });
  } else {
    // COMPARISON: 1 PASTED DATASET AGAINST CURRENT DATABASE
    // 1. Ganda: Detect duplicates in pasted message
    const nameOccurrences = new Map<string, ParsedMusterEntry[]>();
    for (const entry of ds1.entries) {
      const key = entry.matchedPerson ? `id_${entry.matchedPerson.id}` : entry.name.toLowerCase();
      if (!nameOccurrences.has(key)) nameOccurrences.set(key, []);
      nameOccurrences.get(key)!.push(entry);
    }

    nameOccurrences.forEach((entries) => {
      if (entries.length > 1) {
        ganda.push({
          name: entries[0].name,
          rank: entries[0].rank,
          keteranganList: entries.map((e) => e.keterangan),
        });
      }
    });

    // Also check if current database itself has duplicates
    const dbDups = currentList.filter(
      (p, i, arr) => arr.findIndex((x) => x.nama.toLowerCase() === p.nama.toLowerCase()) !== i
    );
    for (const d of dbDups) {
      if (!ganda.some((g) => g.name.toLowerCase() === d.nama.toLowerCase())) {
        const matches = currentList.filter((x) => x.nama.toLowerCase() === d.nama.toLowerCase());
        ganda.push({
          name: d.nama,
          rank: d.pangkat,
          keteranganList: matches.map((m) => `Database: ${m.sub_keterangan_saat_ini}`),
        });
      }
    }

    // 2. Kurang: Personnel in Database who are NOT listed in the pasted text
    const foundPersonIds = new Set<number>();
    const foundNames = new Set<string>();

    ds1.entries.forEach((e) => {
      if (e.matchedPerson) foundPersonIds.add(e.matchedPerson.id);
      foundNames.add(e.name.toLowerCase());
    });

    for (const person of currentList) {
      if (!foundPersonIds.has(person.id) && !foundNames.has(person.nama.toLowerCase())) {
        kurang.push({
          name: person.nama,
          rank: person.pangkat,
          keterangan: `Keterangan DB: ${person.sub_keterangan_saat_ini} (${person.status_dinas})`,
        });
      }
    }

    // 3. Lebih: Personnel listed in the text who do not exist in the Database
    for (const entry of ds1.entries) {
      if (!entry.matchedPerson) {
        // Not found in database
        lebih.push({
          name: entry.name,
          rank: entry.rank,
          keterangan: entry.keterangan,
        });
      }
    }
  }

  // Format Military Response
  let msg = `🔍 *HASIL AUDIT & PENGECEKAN KETERANGAN APEL*\n`;
  if (isDual) {
    msg += `📌 Mode: *Perbandingan 2 Data Keterangan Apel*\n`;
    msg += `• Data 1: ${ds1.entries.length} personel terdeteksi (Jumlah tertera: ${ds1.jumlahStated ?? '-'})\n`;
    msg += `• Data 2: ${ds2?.entries.length ?? 0} personel terdeteksi (Jumlah tertera: ${ds2?.jumlahStated ?? '-'})\n\n`;
  } else {
    msg += `📌 Mode: *Pengecekan Data Apel terhadap Database Kompi Markas*\n`;
    msg += `• Data Teks Apel: ${ds1.entries.length} personel terdeteksi\n`;
    msg += `• Database Organik: ${currentList.length} personel\n\n`;
  }

  // 1. PERSONEL GANDA
  msg += `👥 *1. PERSONEL GANDA (${ganda.length} Orang):*\n`;
  if (ganda.length === 0) {
    msg += `✅ Tidak ada personel ganda / duplikat terdeteksi.\n\n`;
  } else {
    ganda.forEach((g, idx) => {
      const locations = Array.from(new Set(g.keteranganList)).join(' & ');
      msg += ` ${idx + 1}. *${g.rank} ${g.name}*\n    ↳ Tercatat ganda di keterangan: *${locations}*\n`;
    });
    msg += `\n`;
  }

  // 2. PERSONEL KURANG
  msg += `⚠️ *2. PERSONEL KURANG (${kurang.length} Orang):*\n`;
  if (kurang.length === 0) {
    msg += `✅ Seluruh personel terdata lengkap (tidak ada yang kurang).\n\n`;
  } else {
    // Show up to 25 items if too long to prevent overflowing chat
    const displayKurang = kurang.slice(0, 25);
    displayKurang.forEach((k, idx) => {
      msg += ` ${idx + 1}. *${k.rank} ${k.name}*\n    ↳ ${k.keterangan}\n`;
    });
    if (kurang.length > 25) {
      msg += ` ...dan ${kurang.length - 25} personel lainnya belum tercatat.\n`;
    }
    msg += `\n`;
  }

  // 3. PERSONEL LEBIH
  msg += `➕ *3. PERSONEL LEBIH / EKSTRA (${lebih.length} Orang):*\n`;
  if (lebih.length === 0) {
    msg += `✅ Tidak ada personel lebih / nama asing yang tidak dikenal.\n\n`;
  } else {
    lebih.forEach((l, idx) => {
      msg += ` ${idx + 1}. *${l.rank} ${l.name}*\n    ↳ Tercatat di keterangan: *${l.keterangan}*\n`;
    });
    msg += `\n`;
  }

  // RECAP SUMMARY
  msg += `📊 *REKAPITULASI AUDIT:*\n`;
  msg += `• Personel Ganda : ${ganda.length} orang\n`;
  msg += `• Personel Kurang : ${kurang.length} orang\n`;
  msg += `• Personel Lebih  : ${lebih.length} orang\n`;
  if (ganda.length > 0) {
    msg += `💡 *Saran Tindakan:* Buka menu 'Penyelarasan Duplikat' untuk menyelaraskan ke SIAP OPS.`;
  } else if (kurang.length === 0 && lebih.length === 0) {
    msg += `🎖️ *Status Apel:* Sinkron & Valid 100%!`;
  }

  return { message: msg, isDualDataset: isDual, ganda, kurang, lebih };
}

/**
 * NLP Rule-based command parser with Indonesian military phrasing support.
 */
export function parseNlpCommand(
  rawCommand: string,
  currentList: Personnel[]
): { updatedList: Personnel[]; result: NlpCommandResult } {
  const cmd = rawCommand.trim();
  const lower = cmd.toLowerCase();

  // Rule: "hilangkan tanda kurung" / "hapus tanda kurung"
  if (
    lower.includes('hilangkan tanda kurung') ||
    lower.includes('hapus tanda kurung') ||
    lower.includes('bersihkan tanda kurung') ||
    lower.includes('hapus kurung') ||
    lower.includes('hilangkan kurung')
  ) {
    const { updatedList, modifiedCount } = stripParenthesesFromPersonnel(currentList, {
      cleanNames: true,
      cleanRemarks: true,
      cleanSubKet: true,
    });
    return {
      updatedList,
      result: {
        action: 'ASSIGN_SUB_KETERANGAN',
        success: true,
        message: `Tanda kurung '(' dan ')' telah dibersihkan dari ${modifiedCount} data personel (nama dan keterangan).`,
        affectedCount: modifiedCount,
      },
    };
  }

  // Rule 2: "kembalikan semua personel ke keterangan paten"
  if (
    lower.includes('kembalikan semua personel ke keterangan paten') ||
    lower.includes('kembalikan ke paten') ||
    lower.includes('reset semua ke paten') ||
    lower.includes('reset ke paten') ||
    lower === 'reset paten'
  ) {
    const updated = resetAllToPaten(currentList);
    return {
      updatedList: updated,
      result: {
        action: 'RESET_ALL_TO_PATEN',
        success: true,
        message: 'Seluruh personel Kompi Markas telah berhasil dikembalikan ke Keterangan Paten organik masing-masing.',
        affectedCount: updated.length,
      },
    };
  }

  // Rule: WhatsApp Muster Report audit (e.g. "Jumlah: ... Kurang: ... Keterangan: ...")
  const isMusterReport =
    lower.includes('jumlah:') ||
    lower.includes('kurang:') ||
    lower.includes('hadir:') ||
    (lower.includes('keterangan:') && (cmd.includes('\n') || lower.includes('orang'))) ||
    /^(?:jumlah|jml)\s*[:=]/i.test(cmd) ||
    /^(?:kurang|krg)\s*[:=]/i.test(cmd);

  if (isMusterReport) {
    const comparisonResult = analyzeMusterTextComparison(rawCommand, currentList);
    return {
      updatedList: currentList,
      result: {
        action: 'CHECK_MUSTER_TEXT',
        success: true,
        message: comparisonResult.message,
        data: comparisonResult,
      },
    };
  }

  // Rule: Cek Personel Ganda Maupun Kurang (Combined)
  const hasGandaWord =
    lower.includes('ganda') ||
    lower.includes('duplikat') ||
    lower.includes('kembar') ||
    lower.includes('konflik nama');
  const hasKurangWord =
    lower.includes('kurang') ||
    lower.includes('tidak hadir') ||
    lower.includes('yang dinas') ||
    lower.includes('personel dinas') ||
    lower.includes('daftar dinas');

  if (hasGandaWord && hasKurangWord) {
    const report = generateDuplicatesAndKurangReport(currentList);
    return {
      updatedList: currentList,
      result: {
        action: 'CHECK_DUPLICATES_AND_KURANG',
        success: true,
        message: report.message,
        data: report,
      },
    };
  }

  // Rule: Cek Data Personel Ganda
  if (hasGandaWord) {
    const report = generateDuplicatesReport(currentList);
    return {
      updatedList: currentList,
      result: {
        action: 'CHECK_DUPLICATES',
        success: true,
        message: report.message,
        data: report,
      },
    };
  }

  // Rule: Cek Data Personel Kurang
  if (
    hasKurangWord ||
    lower.includes('cek kurang') ||
    lower.includes('siapa yang kurang') ||
    lower.includes('siapa saja yang kurang') ||
    lower.includes('daftar kurang') ||
    lower.includes('rincian kurang') ||
    lower.includes('filter kurang')
  ) {
    const report = generateKurangReport(currentList);
    return {
      updatedList: currentList,
      result: {
        action: 'CHECK_KURANG',
        success: true,
        message: report.message,
        data: report,
      },
    };
  }

  // Rule 4: "cek kelengkapan apel" or "audit apel"
  if (
    lower.includes('cek kelengkapan apel') ||
    lower.includes('audit apel') ||
    lower.includes('cek kehadiran') ||
    lower.includes('audit personel') ||
    lower.includes('status apel')
  ) {
    const summary = calculateMusterSummary(currentList);
    const dupsText =
      summary.duplicates.length > 0
        ? `⚠️ Ditemukan ${summary.duplicates.length} potensi catatan ganda (${summary.duplicates
            .map((d) => d.nama)
            .join(', ')}).`
        : '✅ Tidak ada nama duplikat terdeteksi.';

    return {
      updatedList: currentList,
      result: {
        action: 'RUN_AUDIT',
        success: true,
        message: `📋 Hasil Audit Apel KIMA:\n• Jumlah Total: ${summary.total} Orang\n• Kurang: ${summary.kurang} Orang\n• Hadir (Siap Ops): ${summary.hadir} Orang\n${dupsText}\n• Rincian Kurang: Dinas Dalam (${summary.kategoriBreakdown['DINAS DALAM']}), Dinas Luar (${summary.kategoriBreakdown['DINAS LUAR']}), Dinas Khusus (${summary.kategoriBreakdown['DINAS KHUSUS']}), Lain-lain (${summary.kategoriBreakdown['LAIN LAIN']}).`,
        data: summary,
      },
    };
  }

  // Rule 3: "tampilkan personel pangkat (.+)"
  const rankMatch = lower.match(/(?:tampilkan|lihat|filter|cari)\s+(?:personel\s+)?pangkat\s+([a-zA-Z]+)/i);
  if (rankMatch) {
    const targetRank = rankMatch[1].trim();
    return {
      updatedList: currentList,
      result: {
        action: 'FILTER_BY_RANK',
        success: true,
        message: `Menampilkan daftar personel dengan pangkat ${targetRank}.`,
        data: { targetRank },
      },
    };
  }

  // Filter category command
  const catMatch = lower.match(/(?:tampilkan|lihat|filter)\s+(?:kategori\s+)?(dinas dalam|dinas luar|dinas khusus|lain lain|siap ops)/i);
  if (catMatch) {
    const targetCat = catMatch[1].trim().toUpperCase();
    return {
      updatedList: currentList,
      result: {
        action: 'FILTER_BY_CATEGORY',
        success: true,
        message: `Menampilkan daftar personel kategori ${targetCat}.`,
        data: { targetCategory: targetCat },
      },
    };
  }

  // Rule 1: "masukan (.+) ke keterangan (.+)" or "pindahkan (.+) ke keterangan (.+)" or "masukan (.+) ke (.+)"
  const assignMatch = cmd.match(
    /(?:masuk[k]?an|pindahkan|atur|tempatkan)\s+(.+?)\s+ke\s+(?:keterangan\s+|kategori\s+)?(.+)/i
  );

  if (assignMatch) {
    const targetPersonnelQuery = assignMatch[1].trim();
    const targetSubKeterangan = assignMatch[2].trim();

    // Check if query is still a placeholder like "Prada .../ Serda ..."
    if (targetPersonnelQuery.includes('...')) {
      return {
        updatedList: currentList,
        result: {
          action: 'ASSIGN_SUB_KETERANGAN',
          success: false,
          message: `Silakan ganti "Prada .../ Serda ..." dengan nama personel yang ingin dipindahkan, contoh format: "masukan Prada Ryan ke keterangan siapops".`,
        },
      };
    }

    // Find personnel match
    const matches = findPersonnelMatch(targetPersonnelQuery, currentList);

    if (matches.length === 0) {
      return {
        updatedList: currentList,
        result: {
          action: 'ASSIGN_SUB_KETERANGAN',
          success: false,
          message: `Personel "${targetPersonnelQuery}" tidak ditemukan dalam database Kompi Markas. Mohon periksa ejaan nama atau pangkat.`,
        },
      };
    }

    const { category, status } = inferCategoryAndStatus(targetSubKeterangan);
    const matchIds = new Set(matches.map((m) => m.id));

    const updated = currentList.map((p) => {
      if (matchIds.has(p.id)) {
        return {
          ...p,
          kategori_saat_ini: category,
          sub_keterangan_saat_ini: targetSubKeterangan.toUpperCase(),
          status_dinas: status,
        };
      }
      return p;
    });

    const affectedNames = matches.map((m) => `${m.pangkat} ${m.nama}`).join(', ');

    return {
      updatedList: updated,
      result: {
        action: 'ASSIGN_SUB_KETERANGAN',
        success: true,
        message: `Berhasil memindahkan ${affectedNames} ke keterangan "${targetSubKeterangan.toUpperCase()}" (Kategori: ${category}, Status: ${status}).`,
        affectedCount: matches.length,
        data: { updatedPersonnel: matches },
      },
    };
  }

  // Direct "jadikan siap ops" or "hadirkan"
  const siapOpsMatch = cmd.match(/(?:jadikan\s+siap\s+ops|hadirkan|siap\s+ops)\s+(.+)/i);
  if (siapOpsMatch) {
    const targetQuery = siapOpsMatch[1].trim();
    if (targetQuery.includes('...')) {
      return {
        updatedList: currentList,
        result: {
          action: 'ASSIGN_SUB_KETERANGAN',
          success: false,
          message: `Silakan ganti "..." dengan nama personel yang ingin dijadikan Siap Ops.`,
        },
      };
    }
    const matches = findPersonnelMatch(targetQuery, currentList);
    if (matches.length === 0) {
      return {
        updatedList: currentList,
        result: {
          action: 'ASSIGN_SUB_KETERANGAN',
          success: false,
          message: `Personel "${targetQuery}" tidak ditemukan.`,
        },
      };
    }
    const matchIds = new Set(matches.map((m) => m.id));
    const updated = currentList.map((p) => {
      if (matchIds.has(p.id)) {
        return {
          ...p,
          kategori_saat_ini: 'SIAP OPS' as KategoriDinas,
          sub_keterangan_saat_ini: 'SIAP OPS',
          status_dinas: 'HADIR' as StatusDinas,
        };
      }
      return p;
    });
    return {
      updatedList: updated,
      result: {
        action: 'ASSIGN_SUB_KETERANGAN',
        success: true,
        message: `Berhasil menetapkan ${matches.map((m) => `${m.pangkat} ${m.nama}`).join(', ')} ke SIAP OPS (Status: HADIR).`,
        affectedCount: matches.length,
      },
    };
  }

  // Unknown command
  return {
    updatedList: currentList,
    result: {
      action: 'UNKNOWN',
      success: false,
      message: `Perintah tidak dikenali. Contoh perintah yang dapat digunakan:\n• "masukan Prada .../ Serda ... ke keterangan siapops"\n• "kembalikan semua personel ke keterangan paten"\n• "tampilkan personel pangkat Serda"\n• "cek kelengkapan apel"\n• "cek data personel ganda maupun kurang"\n• Atau tempel pesan apel WA berformat "Jumlah: ... Kurang: ... Keterangan: ..." untuk audit otomatis ganda, kurang, & lebih`,
    },
  };
}

/**
 * Generate official TNI muster report text matching user chat format.
 */
export function generateLaporanApelText(list: Personnel[], dateStr?: string): string {
  const summary = calculateMusterSummary(list);

  // Group by category and preserve ordering of sub_keterangan as in the list
  const dinasDalam: Map<string, string[]> = new Map();
  const dinasLuar: Map<string, string[]> = new Map();
  const dinasKhusus: Map<string, string[]> = new Map();
  const lainLain: Map<string, string[]> = new Map();
  const siapOps: string[] = [];

  list.forEach((p) => {
    const nameLabel = `${p.pangkat} ${p.nama}${p.catatan ? ` (${p.catatan})` : ''}`;
    if (p.kategori_saat_ini === 'SIAP OPS' || p.status_dinas === 'HADIR') {
      siapOps.push(nameLabel);
    } else if (p.kategori_saat_ini === 'DINAS DALAM') {
      const sub = p.sub_keterangan_saat_ini || 'DINAS DALAM';
      if (!dinasDalam.has(sub)) dinasDalam.set(sub, []);
      dinasDalam.get(sub)!.push(nameLabel);
    } else if (p.kategori_saat_ini === 'DINAS LUAR') {
      const sub = p.sub_keterangan_saat_ini || 'DINAS LUAR';
      if (!dinasLuar.has(sub)) dinasLuar.set(sub, []);
      dinasLuar.get(sub)!.push(nameLabel);
    } else if (p.kategori_saat_ini === 'DINAS KHUSUS') {
      const sub = p.sub_keterangan_saat_ini || 'DINAS KHUSUS';
      if (!dinasKhusus.has(sub)) dinasKhusus.set(sub, []);
      dinasKhusus.get(sub)!.push(nameLabel);
    } else {
      const sub = p.sub_keterangan_saat_ini || 'LAIN LAIN';
      if (!lainLain.has(sub)) lainLain.set(sub, []);
      lainLain.get(sub)!.push(nameLabel);
    }
  });

  const formatSection = (title: KategoriDinas, count: number, map: Map<string, string[]>) => {
    let text = `🐯*${title} = ${count}*`;
    const sortedEntries = Array.from(map.entries()).sort(([subA], [subB]) => {
      return getApelSubKetPriority(subA, title, 'KURANG') - getApelSubKetPriority(subB, title, 'KURANG');
    });
    sortedEntries.forEach(([sub, persons]) => {
      text += `\n🐯*${sub}*\n`;
      text += persons.map((person, idx) => ` ${idx + 1}.   ${person}`).join('\n');
    });
    return text;
  };

  const sections: string[] = [];
  if (dinasDalam.size > 0) sections.push(formatSection('DINAS DALAM', summary.kategoriBreakdown['DINAS DALAM'], dinasDalam));
  if (dinasLuar.size > 0) sections.push(formatSection('DINAS LUAR', summary.kategoriBreakdown['DINAS LUAR'], dinasLuar));
  if (dinasKhusus.size > 0) sections.push(formatSection('DINAS KHUSUS', summary.kategoriBreakdown['DINAS KHUSUS'], dinasKhusus));
  if (lainLain.size > 0) sections.push(formatSection('LAIN LAIN', summary.kategoriBreakdown['LAIN LAIN'], lainLain));

  let siapOpsText = `🐯*SIAP OPS =  ${summary.hadir}*`;
  if (siapOps.length > 0) {
    siapOpsText += '\n' + siapOps.map((person, idx) => ` ${idx + 1}.   ${person}`).join('\n');
  }

  return `Jumlah     : ${summary.total}
Kurang      : ${summary.kurang}
Hadir         : ${summary.hadir}
*Keterangan :*

${sections.join('\n\n')}

${siapOpsText}`;
}

