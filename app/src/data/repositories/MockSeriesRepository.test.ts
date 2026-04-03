import assert from 'node:assert/strict';
import test from 'node:test';

import { resetSeriesActivityStore } from '../store/seriesActivityStore';
import { resetSeriesOpenedStore } from '../store/seriesOpenedStore';
import { resetSeriesStore } from '../store/seriesStore';
import { MockSeriesRepository } from './MockSeriesRepository';

test.beforeEach(() => {
  resetSeriesStore();
  resetSeriesActivityStore();
  resetSeriesOpenedStore();
});

test('MockSeriesRepository 能根据作品 ID 返回详情', async () => {
  const repository = new MockSeriesRepository();

  const detail = await repository.getSeriesDetail('one-piece');

  assert.equal(detail?.id, 'one-piece');
  assert.equal(detail?.title, '航海王');
  assert.equal(detail?.chapters.length, 4);
});

test('MockSeriesRepository 对未知作品返回 null', async () => {
  const repository = new MockSeriesRepository();

  const detail = await repository.getSeriesDetail('unknown-series');

  assert.equal(detail, null);
});

test('MockSeriesRepository.listSeriesDetails 返回作品列表', async () => {
  const repository = new MockSeriesRepository();

  const list = await repository.listSeriesDetails();

  assert.ok(list.length >= 5);
  assert.equal(list[0]?.id, 'solo-leveling');
});

test('MockSeriesRepository.updateChapterSummary 更新共享层与私人层内容', async () => {
  const repository = new MockSeriesRepository();

  const changed = await repository.updateChapterSummary('one-piece', 'op-1098', {
    oneLineSummary: 'Edited shared summary',
    privateNote: 'Edited private note',
  });

  const detail = await repository.getSeriesDetail('one-piece');
  const chapter = detail?.chapters.find((item) => item.id === 'op-1098');

  assert.equal(changed, true);
  assert.equal(chapter?.oneLineSummary, 'Edited shared summary');
  assert.equal(chapter?.privateNote, 'Edited private note');
});

test('MockSeriesRepository.listRecentlyUpdatedSeries 返回被更新的作品活动信息', async () => {
  const repository = new MockSeriesRepository();

  const before = await repository.listRecentlyUpdatedSeries();
  await repository.updateChapterSummary('one-piece', 'op-1098', {
    oneLineSummary: 'Edited shared summary',
  });
  const after = await repository.listRecentlyUpdatedSeries();

  assert.equal(before.length, 0);
  assert.equal(after[0]?.seriesId, 'one-piece');
  assert.equal(typeof after[0]?.updatedAt, 'string');
  assert.equal(after[0]?.source, 'edit');
});

test('MockSeriesRepository 可记录并读取作品最近打开时间', async () => {
  const repository = new MockSeriesRepository();

  const before = await repository.listSeriesLastOpened();
  await repository.markSeriesOpened('one-piece', '2026-04-03T07:00:00.000Z');
  const after = await repository.listSeriesLastOpened();

  assert.equal(before.length, 0);
  assert.equal(after[0]?.seriesId, 'one-piece');
  assert.equal(after[0]?.openedAt, '2026-04-03T07:00:00.000Z');
});

test('MockSeriesRepository.createSeries 可创建新作品并默认空章节', async () => {
  const repository = new MockSeriesRepository();

  const created = await repository.createSeries({
    title: 'Dandadan',
    lastReadChapterNumber: '1',
  });

  const detail = await repository.getSeriesDetail(created.id);

  assert.equal(created.title, 'Dandadan');
  assert.equal(created.lastReadChapterNumber, '1');
  assert.equal(created.chapters.length, 0);
  assert.equal(detail?.id, created.id);
  assert.match(created.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('MockSeriesRepository.createSeries 同名作品使用不同 UUID', async () => {
  const repository = new MockSeriesRepository();

  const first = await repository.createSeries({ title: '火影忍者' });
  const second = await repository.createSeries({ title: '火影忍者' });

  assert.notEqual(first.id, second.id);
});

test('MockSeriesRepository.updateSeries 可更新作品标题', async () => {
  const repository = new MockSeriesRepository();

  const changed = await repository.updateSeries('one-piece', {
    title: 'One Piece Reloaded',
  });
  const detail = await repository.getSeriesDetail('one-piece');

  assert.equal(changed, true);
  assert.equal(detail?.title, 'One Piece Reloaded');
});

test('MockSeriesRepository.setLastReadChapterNumber 可更新已读进度', async () => {
  const repository = new MockSeriesRepository();

  const changed = await repository.setLastReadChapterNumber('one-piece', '1097');
  const detail = await repository.getSeriesDetail('one-piece');

  assert.equal(changed, true);
  assert.equal(detail?.lastReadChapterNumber, '1097');
});

test('MockSeriesRepository.deleteSeries 可删除作品', async () => {
  const repository = new MockSeriesRepository();

  const deleted = await repository.deleteSeries('one-piece');
  const detail = await repository.getSeriesDetail('one-piece');

  assert.equal(deleted, true);
  assert.equal(detail, null);
});

test('MockSeriesRepository.createChapter 可新增章节并支持非整数章节号', async () => {
  const repository = new MockSeriesRepository();

  const chapterId = await repository.createChapter('one-piece', {
    number: '番外-1',
    title: 'Special Side Story',
    privateNote: 'A side story chapter.',
    isRead: true,
  });
  const detail = await repository.getSeriesDetail('one-piece');
  const created = detail?.chapters.find((chapter) => chapter.id === chapterId);

  assert.equal(typeof chapterId, 'string');
  assert.equal(created?.number, '番外-1');
  assert.equal(created?.title, 'Special Side Story');
  assert.equal(created?.oneLineSummary, '');
  assert.equal(created?.privateNote, 'A side story chapter.');
  assert.equal(created?.isRead, true);
});

test('MockSeriesRepository.searchReadSummaries 返回命中字段', async () => {
  const repository = new MockSeriesRepository();

  const results = await repository.searchReadSummaries('战斗');

  assert.ok(results.length > 0);
  assert.equal(results[0]?.seriesId, 'one-piece');
  assert.deepEqual(results[0]?.matchedFields, ['tag']);
});
