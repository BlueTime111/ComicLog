import assert from 'node:assert/strict';
import test from 'node:test';

import { MyComic, RecentlyViewedComic } from '../../../types/comic';
import { refreshRecentlyViewedComics, touchRecentlyViewedComics } from './recentlyViewedComics';

const sampleRecent: RecentlyViewedComic[] = [
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    chapterLabel: 'Ch. 120',
    coverColor: '#112039',
    coverAccent: '#F36C5D',
    coverText: 'SL',
  },
  {
    id: 'tower-of-god',
    title: 'Tower of God',
    chapterLabel: 'Ch. 612',
    coverColor: '#1B2E38',
    coverAccent: '#9CD8E8',
    coverText: 'TOG',
  },
];

const sampleComics: MyComic[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    oneLineSummary: 'Summary',
    progressChapter: 1098,
    progressRatio: 0.8,
    status: 'UPDATED',
    updatedAgoLabel: '2h ago',
    coverColor: '#2A8CA8',
    coverAccent: '#D5F1FF',
    coverText: 'OP',
    collection: 'tracking',
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    oneLineSummary: 'Summary',
    progressChapter: 121,
    progressRatio: 0.81,
    status: 'UPDATED',
    updatedAgoLabel: '1h ago',
    coverColor: '#112039',
    coverAccent: '#F36C5D',
    coverText: 'SL',
    collection: 'tracking',
  },
  {
    id: 'tower-of-god',
    title: 'Tower of God',
    oneLineSummary: 'Summary',
    progressChapter: 612,
    progressRatio: 0.9,
    status: 'SYNCED',
    updatedAgoLabel: '3h ago',
    coverColor: '#1B2E38',
    coverAccent: '#9CD8E8',
    coverText: 'TOG',
    collection: 'library',
  },
];

test('touchRecentlyViewedComics 将最新点击作品置顶并去重', () => {
  const updated = touchRecentlyViewedComics(sampleRecent, sampleComics[0]);

  assert.equal(updated[0]?.id, 'one-piece');
  assert.equal(updated[0]?.chapterLabel, 'Ch. 1098');
  assert.equal(updated[1]?.id, 'solo-leveling');
  assert.equal(updated[2]?.id, 'tower-of-god');
});

test('touchRecentlyViewedComics 对已存在作品置顶并刷新章节号', () => {
  const updated = touchRecentlyViewedComics(sampleRecent, sampleComics[1]);

  assert.equal(updated[0]?.id, 'solo-leveling');
  assert.equal(updated[0]?.chapterLabel, 'Ch. 121');
});

test('touchRecentlyViewedComics 在进度为 0 时显示 Ch. 0', () => {
  const updated = touchRecentlyViewedComics(sampleRecent, {
    id: 'new-series',
    title: 'New Series',
    oneLineSummary: '',
    progressChapter: 0,
    progressRatio: 0,
    status: 'SYNCED',
    updatedAgoLabel: 'now',
    coverColor: '#111827',
    coverAccent: '#93C5FD',
    coverText: 'NS',
    collection: 'library',
  });

  assert.equal(updated[0]?.id, 'new-series');
  assert.equal(updated[0]?.chapterLabel, 'Ch. 0');
});

test('touchRecentlyViewedComics 默认最多保留 3 条记录', () => {
  const recent: RecentlyViewedComic[] = [
    ...sampleRecent,
    {
      id: 'omniscient-reader',
      title: 'Omniscient Reader',
      chapterLabel: 'Ch. 200',
      coverColor: '#1F2937',
      coverAccent: '#FBBF24',
      coverText: 'OR',
    },
  ];

  const updated = touchRecentlyViewedComics(recent, sampleComics[0]);

  assert.equal(updated.length, 3);
  assert.equal(updated[0]?.id, 'one-piece');
  assert.equal(updated[1]?.id, 'solo-leveling');
  assert.equal(updated[2]?.id, 'tower-of-god');
});

test('refreshRecentlyViewedComics 在进度回到 0 时更新为 Ch. 0', () => {
  const refreshed = refreshRecentlyViewedComics(
    [
      {
        id: 'new-series',
        title: 'New Series',
        chapterLabel: 'Ch. ?',
        coverColor: '#111827',
        coverAccent: '#93C5FD',
        coverText: 'NS',
      },
    ],
    [
      {
        id: 'new-series',
        title: 'New Series',
        oneLineSummary: '',
        progressChapter: 0,
        progressRatio: 0,
        status: 'SYNCED',
        updatedAgoLabel: 'now',
        coverColor: '#111827',
        coverAccent: '#93C5FD',
        coverText: 'NS',
        collection: 'library',
      },
    ],
  );

  assert.equal(refreshed[0]?.chapterLabel, 'Ch. 0');
});

test('refreshRecentlyViewedComics 会同步最新进度并过滤已不存在作品', () => {
  const refreshed = refreshRecentlyViewedComics(
    [
      ...sampleRecent,
      {
        id: 'deleted-series',
        title: 'Deleted',
        chapterLabel: 'Ch. 1',
        coverColor: '#000000',
        coverAccent: '#FFFFFF',
        coverText: 'DE',
      },
    ],
    sampleComics,
  );

  assert.equal(refreshed.length, 2);
  assert.equal(refreshed[0]?.id, 'solo-leveling');
  assert.equal(refreshed[0]?.chapterLabel, 'Ch. 121');
  assert.equal(refreshed[1]?.id, 'tower-of-god');
});
