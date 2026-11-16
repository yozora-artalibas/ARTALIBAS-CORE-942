import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSpreadsheetId,
  hasPersonnelChanges,
} from './googleSheetsService';
import { Personnel } from '../types/personnel';

test('parseSpreadsheetId correctly extracts ID from various Google Sheets URL formats', () => {
  const url1 = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
  assert.equal(parseSpreadsheetId(url1), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');

  const url2 = 'https://docs.google.com/spreadsheets/d/1abc-xyz_123/edit?usp=sharing';
  assert.equal(parseSpreadsheetId(url2), '1abc-xyz_123');

  const rawId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  assert.equal(parseSpreadsheetId(rawId), '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');

  const empty = '';
  assert.equal(parseSpreadsheetId(empty), '');
});

test('hasPersonnelChanges detects when sheets data has modified patent categories or ranks', () => {
  const current: Personnel[] = [
    {
      id: 1,
      pangkat: 'Prada',
      nama: 'Abel',
      pangkat_level: 7,
      keterangan_paten: 'PROVOOST',
      kategori_saat_ini: 'DINAS DALAM',
      sub_keterangan_saat_ini: 'PROVOOST',
      status_dinas: 'KURANG',
      catatan: '',
    },
    {
      id: 2,
      pangkat: 'Serda',
      nama: 'Zulfi',
      pangkat_level: 4,
      keterangan_paten: 'SIAP OPS',
      kategori_saat_ini: 'SIAP OPS',
      sub_keterangan_saat_ini: 'SIAP OPS',
      status_dinas: 'HADIR',
      catatan: '',
    },
  ];

  // No change
  const unchanged: Personnel[] = [
    { ...current[0] },
    { ...current[1] },
  ];
  assert.equal(hasPersonnelChanges(current, unchanged), false);

  // Patent category changed in Google Sheet (e.g. Zulfi changed to BIMTEK WABKU)
  const modifiedPatent: Personnel[] = [
    { ...current[0] },
    { ...current[1], keterangan_paten: 'BIMTEK WABKU' },
  ];
  assert.equal(hasPersonnelChanges(current, modifiedPatent), true);

  // Rank changed in Google Sheet (e.g. Abel promoted to Pratu)
  const modifiedRank: Personnel[] = [
    { ...current[0], pangkat: 'Pratu' },
    { ...current[1] },
  ];
  assert.equal(hasPersonnelChanges(current, modifiedRank), true);

  // Note changed in Google Sheet
  const modifiedNote: Personnel[] = [
    { ...current[0], catatan: 'Catatan Khusus' },
    { ...current[1] },
  ];
  assert.equal(hasPersonnelChanges(current, modifiedNote), true);

  // Length changed (new personnel added)
  const added: Personnel[] = [
    ...current,
    {
      id: 3,
      pangkat: 'Prada',
      nama: 'Baru',
      pangkat_level: 7,
      keterangan_paten: 'TON ANG',
      kategori_saat_ini: 'LAIN LAIN',
      sub_keterangan_saat_ini: 'TON ANG',
      status_dinas: 'KURANG',
      catatan: '',
    },
  ];
  assert.equal(hasPersonnelChanges(current, added), true);
});
