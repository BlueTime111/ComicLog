import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCreateSeriesInput, normalizeLastReadChapterNumber } from './seriesManageForm';

test('buildCreateSeriesInput 新建作品时固定从 Ch.0 开始', () => {
  const input = buildCreateSeriesInput(' 海贼王 ');

  assert.equal(input.title, '海贼王');
  assert.equal(input.lastReadChapterNumber, '0');
});

test('normalizeLastReadChapterNumber 在编辑模式为空时回退到 0', () => {
  const chapterNumber = normalizeLastReadChapterNumber('   ');

  assert.equal(chapterNumber, '0');
});
