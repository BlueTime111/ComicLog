import assert from 'node:assert/strict';
import test from 'node:test';

import { samplePackRawJson } from '../../../data/mock/importPacks';
import { buildImportConflictDetails, buildImportDiff, parseSummaryPack } from './summaryPack';

test('parseSummaryPack 能解析合法总结包 JSON', () => {
  const raw = JSON.stringify({
    schemaVersion: '1.0',
    series: {
      id: 'one-piece',
      title: 'One Piece',
    },
    pack: {
      packId: 'pack_op_v2',
      title: 'One Piece Pack',
      author: 'alice',
      version: 2,
      updatedAt: '2026-03-30T10:00:00Z',
      coverage: { start: '1', end: '1100' },
    },
    chapters: [
      { number: '1098', summary: 'New summary' },
      { number: '1100', summary: 'Another summary' },
    ],
  });

  const parsed = parseSummaryPack(raw);

  assert.equal(parsed.error, null);
  assert.equal(parsed.data?.series.id, 'one-piece');
  assert.equal(parsed.data?.chapters.length, 2);
});

test('parseSummaryPack 在关键字段缺失时返回错误', () => {
  const raw = JSON.stringify({
    series: { id: 'one-piece', title: 'One Piece' },
    pack: { packId: 'pack_op_v2' },
    chapters: [],
  });

  const parsed = parseSummaryPack(raw);

  assert.equal(parsed.data, null);
  assert.equal(parsed.error, '总结包格式无效：缺少 schemaVersion。');
});

test('buildImportDiff 正确计算新增、更新、冲突数量', () => {
  const diff = buildImportDiff(
    [
      { number: '1098', summary: 'Updated summary' },
      { number: '1099', summary: 'Same summary' },
      { number: '1100', summary: 'New chapter summary' },
    ],
    [
      { number: '1098', oneLineSummary: 'Old summary' },
      { number: '1099', oneLineSummary: 'Same summary' },
    ],
  );

  assert.deepEqual(diff, {
    addedCount: 1,
    updatedCount: 1,
    conflictCount: 1,
    unchangedCount: 1,
  });
});

test('buildImportConflictDetails 返回冲突章节明细', () => {
  const details = buildImportConflictDetails(
    [
      { number: '1098', summary: 'Incoming new summary' },
      { number: '1100', summary: 'Brand new chapter' },
    ],
    [{ number: '1098', oneLineSummary: 'Existing old summary' }],
  );

  assert.equal(details.length, 1);
  assert.deepEqual(details[0], {
    number: '1098',
    existingSummary: 'Existing old summary',
    incomingSummary: 'Incoming new summary',
  });
});

test('samplePackRawJson 默认总结不带导入总结前缀', () => {
  const parsed = parseSummaryPack(samplePackRawJson);

  assert.equal(parsed.error, null);
  assert.equal(parsed.data?.chapters[0]?.summary.startsWith('导入总结：'), false);
  assert.equal(parsed.data?.chapters[1]?.summary.startsWith('导入总结：'), false);
});
