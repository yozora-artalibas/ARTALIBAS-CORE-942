import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getShortRankCode,
  getAvatarColorClasses,
  countActiveAdvancedFilters,
  QUICK_APEL_PRESETS,
  buildSyncedApelOptions,
} from './mobileHelpers';

test('getShortRankCode extracts concise uppercase rank badge label', () => {
  assert.equal(getShortRankCode('Letda Inf'), 'LETDA');
  assert.equal(getShortRankCode('Serka'), 'SERKA');
  assert.equal(getShortRankCode('Prada'), 'PRADA');
  assert.equal(getShortRankCode(''), 'PRS');
});

test('getAvatarColorClasses maps military rank tiers accurately', () => {
  assert.ok(getAvatarColorClasses('Letda Inf').includes('amber'));
  assert.ok(getAvatarColorClasses('Serda').includes('yellow'));
  assert.ok(getAvatarColorClasses('Pratu').includes('rose'));
});

test('countActiveAdvancedFilters counts non-default filters cleanly', () => {
  assert.equal(countActiveAdvancedFilters({ selectedRank: 'Semua', selectedSubKet: 'Semua' }), 0);
  assert.equal(countActiveAdvancedFilters({ selectedRank: 'Serda', selectedSubKet: 'Semua' }), 1);
  assert.equal(countActiveAdvancedFilters({ selectedRank: 'Serda', selectedSubKet: 'SIAP OPS' }), 2);
});

test('QUICK_APEL_PRESETS includes SIAP OPS and KOSONG and excludes TMMD', () => {
  assert.ok(QUICK_APEL_PRESETS.some((p) => p.subKet === 'SIAP OPS' && p.category === 'SIAP OPS'));
  assert.ok(QUICK_APEL_PRESETS.some((p) => p.subKet === 'KOSONG'));
  assert.equal(QUICK_APEL_PRESETS.some((p) => p.subKet === 'TMMD' || p.label === 'TMMD'), false);
});

test('buildSyncedApelOptions strictly mirrors subKetList and patentCategories without hardcoded extras', () => {
  const synced = buildSyncedApelOptions(
    ['TMMD', 'PIKET BARU', 'PROVOST'],
    ['STAF INTEL', 'TON PAL', 'TMMD', 'PROVOOST']
  );
  assert.equal(synced[0].subKet, 'SIAP OPS');
  assert.equal(synced[synced.length - 1].subKet, 'KOSONG');
  assert.equal(synced.some((p) => p.subKet === 'TMMD'), false);
  assert.equal(synced.some((p) => p.subKet === 'GARJAS PERIODIK GEL. 2'), false);
  assert.equal(synced.some((p) => p.subKet === 'KOPERASI'), false);
  assert.ok(synced.some((p) => p.subKet === 'PIKET BARU'));
  assert.ok(synced.some((p) => p.subKet === 'STAF INTEL' && p.category === 'LAIN LAIN'));
  assert.ok(synced.some((p) => p.subKet === 'TON PAL'));
  assert.equal(synced.filter((p) => p.subKet === 'PROVOOST').length, 1);
});
