import assert from 'node:assert/strict';
import test from 'node:test';

import { mapSeriesToHomeComic } from './homeComicMapper';
import { SeriesDetail } from '../../series/domain/series';

test('mapSeriesToHomeComic 使用已读章节的一句话总结作为卡片主文案', () => {
  const series: SeriesDetail = {
    id: 'one-piece',
    title: 'One Piece',
    lastReadChapterNumber: '1098',
    chapters: [
      {
        id: 'op-1097',
        number: '1097',
        title: 'Ancient Spark',
        oneLineSummary: 'Old summary',
        isRead: true,
      },
      {
        id: 'op-1098',
        number: '1098',
        title: 'Awakening Echo',
        oneLineSummary: 'Latest read summary',
        isRead: true,
      },
    ],
  };

  const mapped = mapSeriesToHomeComic(series, {
    coverColor: '#2A8CA8',
    coverAccent: '#D5F1FF',
    coverText: 'OP',
    collection: 'tracking',
    updatedAgoLabel: 'now',
    status: 'UPDATED',
  });

  assert.equal(mapped.progressChapter, 1098);
  assert.equal(mapped.oneLineSummary, 'Latest read summary');
  assert.equal(mapped.statusLabel, 'UPDATED');
});

test('mapSeriesToHomeComic 在无匹配章节时使用兜底文案', () => {
  const series: SeriesDetail = {
    id: 'new-series',
    title: 'New Series',
    lastReadChapterNumber: '2',
    chapters: [{ id: 'c1', number: '1', title: 'Start', oneLineSummary: 'Only chapter', isRead: true }],
  };

  const mapped = mapSeriesToHomeComic(series, {
    coverColor: '#1F2937',
    coverAccent: '#CBD5E1',
    coverText: 'NS',
    collection: 'library',
    updatedAgoLabel: 'now',
    status: 'SYNCED',
  });

  assert.equal(mapped.oneLineSummary, '');
  assert.equal(mapped.statusLabel, 'SYNCED');
});

test('mapSeriesToHomeComic 在共享层为空时优先显示私人补充', () => {
  const series: SeriesDetail = {
    id: 'naruto',
    title: 'Naruto',
    lastReadChapterNumber: '1',
    chapters: [
      {
        id: 'na-1',
        number: '1',
        title: 'Start',
        oneLineSummary: '暂无对应已读章节总结。',
        privateNote: 'My private recap',
        isRead: true,
      },
    ],
  };

  const mapped = mapSeriesToHomeComic(series, {
    coverColor: '#1F2937',
    coverAccent: '#CBD5E1',
    coverText: 'NA',
    collection: 'tracking',
    updatedAgoLabel: 'now',
    status: 'UPDATED',
  });

  assert.equal(mapped.oneLineSummary, 'My private recap');
});

test('mapSeriesToHomeComic 在共享层与私人补充都为空时使用兜底文案', () => {
  const series: SeriesDetail = {
    id: 'bleach',
    title: 'Bleach',
    lastReadChapterNumber: '1',
    chapters: [
      {
        id: 'bl-1',
        number: '1',
        title: 'Start',
        oneLineSummary: '',
        privateNote: '   ',
        isRead: true,
      },
    ],
  };

  const mapped = mapSeriesToHomeComic(series, {
    coverColor: '#1F2937',
    coverAccent: '#CBD5E1',
    coverText: 'BL',
    collection: 'tracking',
    updatedAgoLabel: 'now',
    status: 'UPDATED',
  });

  assert.equal(mapped.oneLineSummary, '');
});

test('mapSeriesToHomeComic 支持覆盖状态文案', () => {
  const series: SeriesDetail = {
    id: 'one-piece',
    title: 'One Piece',
    lastReadChapterNumber: '1098',
    chapters: [
      {
        id: 'op-1098',
        number: '1098',
        title: 'Awakening Echo',
        oneLineSummary: 'Latest read summary',
        isRead: true,
      },
    ],
  };

  const mapped = mapSeriesToHomeComic(series, {
    coverColor: '#2A8CA8',
    coverAccent: '#D5F1FF',
    coverText: 'OP',
    collection: 'tracking',
    updatedAgoLabel: 'now',
    status: 'UPDATED',
    statusLabel: 'IMPORTED',
  });

  assert.equal(mapped.statusLabel, 'IMPORTED');
});
