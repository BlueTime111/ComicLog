import assert from 'node:assert/strict';
import test from 'node:test';

import { MyComic, RecentlyViewedComic } from '../../../types/comic';
import { createHomeBootstrapState } from './homeBootstrap';

const sampleComics: MyComic[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    oneLineSummary: 'Summary',
    progressChapter: 1098,
    progressRatio: 0.86,
    status: 'UPDATED',
    updatedAgoLabel: '2h ago',
    coverColor: '#2A8CA8',
    coverAccent: '#D5F1FF',
    coverText: 'OP',
    collection: 'tracking',
  },
];

const sampleRecent: RecentlyViewedComic[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    chapterLabel: 'Ch. 1098',
    coverColor: '#2A8CA8',
    coverAccent: '#D5F1FF',
    coverText: 'OP',
  },
];

test('createHomeBootstrapState 在 mock 数据源保留预置首页卡片', () => {
  const state = createHomeBootstrapState('mock', sampleComics, sampleRecent);

  assert.equal(state.computedComics.length, 1);
  assert.equal(state.recentComics.length, 1);
});

test('createHomeBootstrapState 在 sqlite 数据源不注入 mock 卡片', () => {
  const state = createHomeBootstrapState('sqlite', sampleComics, sampleRecent);

  assert.equal(state.computedComics.length, 0);
  assert.equal(state.recentComics.length, 0);
});
