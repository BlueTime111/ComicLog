import assert from 'node:assert/strict';
import test from 'node:test';

import { buildExportFileName, serializeExportPack } from './exportPayload';
import { SummaryPack } from '../../import/domain/summaryPack';

const samplePack: SummaryPack = {
  schemaVersion: '1.0',
  series: { id: 'one-piece', title: 'One Piece' },
  pack: {
    packId: 'pack_op_v1',
    title: 'One Piece Shared Pack',
    author: 'local-user',
    version: 1,
    updatedAt: '2026-03-31T10:00:00Z',
    coverage: { start: '1', end: '1098' },
  },
  chapters: [{ number: '1098', title: 'Awakening Echo', summary: 'Shared summary' }],
};

test('serializeExportPack 输出可读 JSON 文本', () => {
  const raw = serializeExportPack(samplePack);

  assert.ok(raw.includes('"schemaVersion": "1.0"'));
  assert.ok(raw.includes('"packId": "pack_op_v1"'));
  assert.ok(raw.includes('"summary": "Shared summary"'));
});

test('buildExportFileName 生成稳定且安全的 json 文件名', () => {
  const fileName = buildExportFileName({
    seriesId: 'one piece',
    version: 12,
    timestamp: '2026-03-31T10:00:00Z',
  });

  assert.equal(fileName, 'summary-pack-one-piece-v12-2026-03-31.json');
});
