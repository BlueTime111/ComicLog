import assert from 'node:assert/strict';
import test from 'node:test';

import { MyComic } from '../../types/comic';
import {
  getRecentlyViewedStore,
  resetRecentlyViewedStore,
  setRecentlyViewedStore,
} from './recentlyViewedStore';
import { refreshRecentlyViewedComics, touchRecentlyViewedComics } from '../../features/home/domain/recentlyViewedComics';

const comicA: MyComic = {
  id: 'comic-a',
  title: 'Comic A',
  oneLineSummary: 'A',
  progressChapter: 10,
  progressRatio: 0.5,
  status: 'UPDATED',
  updatedAgoLabel: '刚刚',
  coverColor: '#111111',
  coverAccent: '#222222',
  coverText: 'A',
  collection: 'tracking',
};

const comicB: MyComic = {
  id: 'comic-b',
  title: 'Comic B',
  oneLineSummary: 'B',
  progressChapter: 20,
  progressRatio: 0.8,
  status: 'UPDATED',
  updatedAgoLabel: '刚刚',
  coverColor: '#333333',
  coverAccent: '#444444',
  coverText: 'B',
  collection: 'tracking',
};

test.beforeEach(() => {
  resetRecentlyViewedStore();
});

test('recentlyViewedStore 在会话内保留最近阅读顺序', () => {
  const first = touchRecentlyViewedComics(getRecentlyViewedStore(), comicA);
  setRecentlyViewedStore(first);

  const second = touchRecentlyViewedComics(getRecentlyViewedStore(), comicB);
  setRecentlyViewedStore(second);

  assert.equal(getRecentlyViewedStore()[0]?.id, 'comic-b');
  assert.equal(getRecentlyViewedStore()[1]?.id, 'comic-a');
});

test('删除最近阅读第一项后，后一项仍保留', () => {
  const first = touchRecentlyViewedComics(getRecentlyViewedStore(), comicA);
  const second = touchRecentlyViewedComics(first, comicB);
  setRecentlyViewedStore(second);

  const refreshed = refreshRecentlyViewedComics(getRecentlyViewedStore(), [comicB]);
  setRecentlyViewedStore(refreshed);

  assert.equal(getRecentlyViewedStore().length, 1);
  assert.equal(getRecentlyViewedStore()[0]?.id, 'comic-b');
});
