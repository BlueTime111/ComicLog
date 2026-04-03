import assert from 'node:assert/strict';
import test from 'node:test';

import { buildExportPack } from './exportPack';
import { SeriesDetail } from '../../series/domain/series';

const seriesDetail: SeriesDetail = {
  id: 'one-piece',
  title: 'One Piece',
  lastReadChapterNumber: '1098',
  chapters: [
    {
      id: 'op-1098',
      number: '1098',
      title: 'Awakening Echo',
      oneLineSummary: 'Shared summary',
      privateNote: 'Private note must stay local',
      privateTags: ['private'],
      isRead: true,
    },
  ],
};

const mixedReadStateSeries: SeriesDetail = {
  id: 'one-piece',
  title: 'One Piece',
  lastReadChapterNumber: '1098',
  chapters: [
    {
      id: 'op-1098',
      number: '1098',
      title: 'Awakening Echo',
      oneLineSummary: 'Read summary',
      isRead: true,
    },
    {
      id: 'op-1099',
      number: '1099',
      title: 'Unseen Tide',
      oneLineSummary: 'Unread summary',
      isRead: false,
    },
  ],
};

test('buildExportPack 生成符合 schema 的共享层总结包', () => {
  const pack = buildExportPack(seriesDetail, {
    packId: 'pack_op_v1',
    packTitle: 'One Piece Shared Pack',
    author: 'owner',
    version: 1,
    updatedAt: '2026-03-30T12:30:00Z',
  });

  assert.equal(pack.schemaVersion, '1.0');
  assert.equal(pack.series.id, 'one-piece');
  assert.equal(pack.pack.coverage.end, '1098');
  assert.equal(pack.chapters[0]?.summary, 'Shared summary');
});

test('buildExportPack 默认不导出私人备注与私人标签', () => {
  const pack = buildExportPack(seriesDetail, {
    packId: 'pack_op_v1',
    packTitle: 'One Piece Shared Pack',
    author: 'owner',
    version: 1,
    updatedAt: '2026-03-30T12:30:00Z',
  });

  const chapter = pack.chapters[0] as Record<string, unknown>;

  assert.equal(chapter.privateNote, undefined);
  assert.equal(chapter.privateTags, undefined);
  assert.equal(chapter.summary, 'Shared summary');
});

test('buildExportPack 在 includeOnlyReadChapters=true 时仅导出已读章节', () => {
  const pack = buildExportPack(mixedReadStateSeries, {
    packId: 'pack_op_v2',
    packTitle: 'One Piece Shared Pack',
    author: 'owner',
    version: 2,
    updatedAt: '2026-03-30T12:45:00Z',
    includeOnlyReadChapters: true,
  } as any);

  assert.equal(pack.chapters.length, 1);
  assert.equal(pack.chapters[0]?.number, '1098');
  assert.equal(pack.pack.coverage.end, '1098');
});
