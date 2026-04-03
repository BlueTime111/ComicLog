import assert from 'node:assert/strict';
import test from 'node:test';

import { resetImportLogStore } from '../store/importLogStore';
import { resetSeriesActivityStore } from '../store/seriesActivityStore';
import { resetSeriesStore } from '../store/seriesStore';
import { MockImportRepository } from './MockImportRepository';
import { MockSeriesRepository } from './MockSeriesRepository';
import { SummaryPack } from '../../features/import/domain/summaryPack';

const samplePack: SummaryPack = {
  schemaVersion: '1.0',
  series: {
    id: 'one-piece',
    title: 'One Piece',
  },
  pack: {
    packId: 'pack_one_piece_v99',
    title: 'One Piece Weekly Pack',
    author: 'pack_author',
    version: 99,
    updatedAt: '2026-03-30T11:00:00Z',
    coverage: {
      start: '1',
      end: '1100',
    },
  },
  chapters: [
    {
      number: '1098',
      title: 'Awakening Echo',
      summary: 'Updated from imported pack.',
    },
    {
      number: '1100',
      title: 'Aftershock',
      summary: 'A new chapter from pack.',
    },
  ],
};

test.beforeEach(() => {
  resetSeriesStore();
  resetImportLogStore();
  resetSeriesActivityStore();
});

test('MockImportRepository.previewPack 正确返回导入预览统计', async () => {
  const repository = new MockImportRepository();

  const preview = await repository.previewPack(samplePack);

  assert.equal(preview.seriesId, 'one-piece');
  assert.equal(preview.chapterCount, 2);
  assert.equal(preview.addedCount, 1);
  assert.equal(preview.updatedCount, 1);
  assert.equal(preview.conflictCount, 1);
  assert.equal(preview.conflictChapters.length, 1);
  assert.equal(preview.conflictChapters[0]?.number, '1098');
});

test('missingOnly 策略仅导入缺失章节，不覆盖已有共享层', async () => {
  const importRepository = new MockImportRepository();
  const seriesRepository = new MockSeriesRepository();

  const result = await importRepository.applyPack(samplePack, 'missingOnly');
  const detail = await seriesRepository.getSeriesDetail('one-piece');

  assert.equal(result.addedCount, 1);
  assert.equal(result.updatedCount, 0);
  assert.equal(result.conflictCount, 1);
  assert.ok(detail);

  const chapter1098 = detail?.chapters.find((chapter) => chapter.number === '1098');
  const chapter1100 = detail?.chapters.find((chapter) => chapter.number === '1100');

  assert.equal(
    chapter1098?.oneLineSummary,
    '路飞新形态觉醒后将压力转化为推进力。',
  );
  assert.equal(chapter1100?.oneLineSummary, 'A new chapter from pack.');
});

test('overwriteShared 策略更新共享层，同时保留私人备注', async () => {
  const importRepository = new MockImportRepository();
  const seriesRepository = new MockSeriesRepository();

  const result = await importRepository.applyPack(samplePack, 'overwriteShared');
  const detail = await seriesRepository.getSeriesDetail('one-piece');

  const chapter1098 = detail?.chapters.find((chapter) => chapter.number === '1098');

  assert.equal(result.updatedCount, 1);
  assert.equal(result.preservedPrivateCount, 1);
  assert.equal(chapter1098?.oneLineSummary, 'Updated from imported pack.');
  assert.equal(chapter1098?.privateNote, '关注变身后的体力消耗描述，可能影响下几话节奏。');
});

test('applyPack 后可在导入日志中看到记录（供 Library 展示）', async () => {
  const importRepository = new MockImportRepository();

  await importRepository.applyPack(samplePack, 'overwriteShared');
  const logs = await importRepository.listImportLogs();

  assert.equal(logs.length, 1);
  assert.equal(logs[0]?.packId, 'pack_one_piece_v99');
  assert.equal(logs[0]?.seriesId, 'one-piece');
  assert.equal(logs[0]?.strategy, 'overwriteShared');
  assert.equal(logs[0]?.addedCount, 1);
  assert.equal(logs[0]?.updatedCount, 1);
});

test('MockImportRepository.applyPack 记录 import 来源的最近更新活动', async () => {
  const importRepository = new MockImportRepository();
  const seriesRepository = new MockSeriesRepository();

  await importRepository.applyPack(samplePack, 'overwriteShared');
  const updated = await seriesRepository.listRecentlyUpdatedSeries();

  assert.equal(updated.length, 1);
  assert.equal(updated[0]?.seriesId, 'one-piece');
  assert.equal(updated[0]?.source, 'import');
});

test('manual 策略可按章节选择保留本地共享层', async () => {
  const importRepository = new MockImportRepository();
  const seriesRepository = new MockSeriesRepository();

  const result = await importRepository.applyPack(samplePack, 'manual', [
    { number: '1098', resolution: 'keepLocal' },
  ]);

  const detail = await seriesRepository.getSeriesDetail('one-piece');
  const chapter1098 = detail?.chapters.find((chapter) => chapter.number === '1098');

  assert.equal(result.updatedCount, 0);
  assert.equal(result.conflictCount, 1);
  assert.equal(
    chapter1098?.oneLineSummary,
    '路飞新形态觉醒后将压力转化为推进力。',
  );
});

test('manual 策略可按章节选择采用导入共享层', async () => {
  const importRepository = new MockImportRepository();
  const seriesRepository = new MockSeriesRepository();

  const result = await importRepository.applyPack(samplePack, 'manual', [
    { number: '1098', resolution: 'useIncoming' },
  ]);

  const detail = await seriesRepository.getSeriesDetail('one-piece');
  const chapter1098 = detail?.chapters.find((chapter) => chapter.number === '1098');

  assert.equal(result.updatedCount, 1);
  assert.equal(result.preservedPrivateCount, 1);
  assert.equal(chapter1098?.oneLineSummary, 'Updated from imported pack.');
});

test('series.id 不匹配时创建新作品而不是按标题合并', async () => {
  const importRepository = new MockImportRepository();
  const seriesRepository = new MockSeriesRepository();

  const idMismatchedPack: SummaryPack = {
    ...samplePack,
    series: {
      id: 'series',
      title: 'One Piece',
    },
  };

  const result = await importRepository.applyPack(idMismatchedPack, 'missingOnly');
  const list = await seriesRepository.listSeriesDetails();
  const detail = await seriesRepository.getSeriesDetail('series');

  assert.equal(result.addedCount, 2);
  assert.equal(list.some((item) => item.id === 'series'), true);
  assert.ok(detail?.chapters.some((chapter) => chapter.number === '1098'));
  assert.ok(detail?.chapters.some((chapter) => chapter.number === '1100'));
});
