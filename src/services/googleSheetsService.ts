import { Personnel, KategoriDinas } from '../types/personnel';
import { getRankLevel, inferCategoryAndStatus } from '../utils/personnelLogic';

export interface SheetMetadata {
  title: string;
  sheets: string[];
}

export interface SheetSyncResult {
  personnel: Personnel[];
  categories: string[];
  totalRows: number;
}

/**
 * Parses a Google Sheets URL or extracts raw spreadsheet ID.
 * Examples:
 * - https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
 * - 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
 */
export function parseSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Fetches spreadsheet metadata (title and sheet tab names) without hardcoding "Sheet1".
 */
export async function fetchSpreadsheetMetadata(
  spreadsheetId: string,
  accessToken: string
): Promise<SheetMetadata> {
  const cleanId = parseSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('ID Spreadsheet Google tidak valid.');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error?.message || `HTTP ${res.status}: Gagal memuat metadata spreadsheet.`;
    throw new Error(message);
  }

  const data = await res.json();
  const title = data.properties?.title || 'Google Sheet';
  const sheets: string[] = (data.sheets || []).map((s: any) => s.properties?.title).filter(Boolean);

  return {
    title,
    sheets: sheets.length > 0 ? sheets : ['Sheet1'],
  };
}

/**
 * Fetches live personnel data from a specific tab in the Google Sheet.
 */
export async function fetchPersonnelFromSheet(
  spreadsheetId: string,
  sheetTab: string,
  accessToken: string,
  existingList: Personnel[] = []
): Promise<SheetSyncResult> {
  const cleanId = parseSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('ID Spreadsheet tidak valid.');

  const range = `${encodeURIComponent(sheetTab)}!A1:Z250`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error?.message || `HTTP ${res.status}: Gagal membaca data Google Sheets.`;
    throw new Error(message);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  if (rows.length === 0) {
    return { personnel: [], categories: [], totalRows: 0 };
  }

  // Detect header row (check row 0)
  let headerRowIndex = -1;
  let colNo = -1;
  let colPangkat = -1;
  let colNama = -1;
  let colKategori = -1;
  let colPaten = -1;
  let colCatatan = -1;

  for (let r = 0; r < Math.min(3, rows.length); r++) {
    const row = rows[r].map((cell: any) => String(cell || '').trim().toLowerCase());
    const hasPangkat = row.some((c: string) => c.includes('pangkat') || c === 'pkt');
    const hasNama = row.some((c: string) => c.includes('nama'));

    if (hasPangkat && hasNama) {
      headerRowIndex = r;
      row.forEach((cell: string, idx: number) => {
        if (cell === 'no' || cell.includes('nomor')) colNo = idx;
        else if (cell.includes('pangkat') || cell === 'pkt') colPangkat = idx;
        else if (cell.includes('nama')) colNama = idx;
        else if (cell.includes('kategori')) colKategori = idx;
        else if (cell.includes('paten') || cell.includes('organik') || cell.includes('keterangan')) colPaten = idx;
        else if (cell.includes('catatan') || cell.includes('ket') || cell.includes('keterangan khusus')) colCatatan = idx;
      });
      break;
    }
  }

  // Fallback default column indices if header not detected
  if (headerRowIndex === -1) {
    headerRowIndex = 0; // assume row 0 is header or first row
    colNo = 0;
    colPangkat = 1;
    colNama = 2;
    colKategori = 3;
    colPaten = 4;
    colCatatan = 5;
  } else {
    // If specific columns were not found, use sensible defaults
    if (colPangkat === -1) colPangkat = 1;
    if (colNama === -1) colNama = 2;
    if (colPaten === -1) colPaten = 4;
  }

  const existingMap = new Map<string, Personnel>();
  existingList.forEach((p) => {
    existingMap.set(p.nama.trim().toLowerCase(), p);
  });

  const parsedPersonnel: Personnel[] = [];
  const foundCategories = new Set<string>();
  const now = new Date().toISOString();

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawNama = String(row[colNama] || '').trim();
    if (!rawNama) continue;

    const rawPangkat = String(row[colPangkat] || 'Prada').trim();
    const rawPaten = colPaten !== -1 && row[colPaten] ? String(row[colPaten]).trim().toUpperCase() : 'SIAP OPS';
    const rawCatatan = colCatatan !== -1 && row[colCatatan] ? String(row[colCatatan]).trim() : '';

    const cleanPaten = rawPaten.replace(/[\*\"]/g, '').trim().toUpperCase();
    if (cleanPaten) {
      foundCategories.add(cleanPaten);
    }

    const { category, status } = inferCategoryAndStatus(cleanPaten);
    const existing = existingMap.get(rawNama.toLowerCase());

    const personId = existing?.id || (colNo !== -1 && Number(row[colNo])) || r + 1;

    parsedPersonnel.push({
      id: personId,
      pangkat: rawPangkat,
      nama: rawNama,
      pangkat_level: getRankLevel(rawPangkat),
      keterangan_paten: cleanPaten || 'SIAP OPS',
      kategori_saat_ini: existing ? existing.kategori_saat_ini : category,
      sub_keterangan_saat_ini: existing ? existing.sub_keterangan_saat_ini : cleanPaten,
      status_dinas: existing ? existing.status_dinas : status,
      catatan: rawCatatan || existing?.catatan || '',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
  }

  return {
    personnel: parsedPersonnel,
    categories: Array.from(foundCategories),
    totalRows: parsedPersonnel.length,
  };
}

/**
 * Checks if the sheet data differs from current personnel list.
 */
export function hasPersonnelChanges(currentList: Personnel[], sheetList: Personnel[]): boolean {
  if (currentList.length !== sheetList.length) return true;

  const currentMap = new Map<string, Personnel>();
  currentList.forEach((p) => currentMap.set(p.nama.toLowerCase(), p));

  for (const s of sheetList) {
    const c = currentMap.get(s.nama.toLowerCase());
    if (!c) return true;
    if (c.pangkat !== s.pangkat) return true;
    if (c.keterangan_paten !== s.keterangan_paten) return true;
    if ((c.catatan || '') !== (s.catatan || '')) return true;
  }

  return false;
}

/**
 * Exports current personnel master database to Google Sheets.
 * Uses USER_ENTERED formatting.
 */
export async function exportPersonnelToSheet(
  spreadsheetId: string,
  sheetTab: string,
  list: Personnel[],
  accessToken: string
): Promise<void> {
  const cleanId = parseSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('ID Spreadsheet tidak valid.');

  const headers = ['No', 'Pangkat', 'Nama Personel', 'Kategori Utama', 'Keterangan Paten', 'Catatan'];
  const dataRows = list.map((p, idx) => [
    idx + 1,
    p.pangkat,
    p.nama,
    p.kategori_saat_ini,
    p.keterangan_paten,
    p.catatan || '',
  ]);

  const allRows = [headers, ...dataRows];
  const range = `${encodeURIComponent(sheetTab)}!A1:F${allRows.length}`;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: allRows,
      }),
    }
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error?.message || `HTTP ${res.status}: Gagal mengekspor data ke Google Sheet.`;
    throw new Error(message);
  }
}
