import assert from 'node:assert/strict';
import test from 'node:test';

import { MyComic, RecentlyViewedComic } from '../../../types/comic';
import {
  filterHomeComicsByInlineQuery,
  filterRecentlyViewedComicsByInlineQuery,
  hasInlineSearchQuery,
} from './homeInlineSearch';

const comics: MyComic[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    oneLineSummary: 'Luffy awakens and turns pressure into momentum.',
    progressChapter: 1098,
    progressRatio: 0.93,
    status: 'SYNCED',
    updatedAgoLabel: '2h ago',
    coverColor: '#0ea5e9',
    coverAccent: '#bae6fd',
    coverText: 'OP',
    collection: 'tracking',
  },
  {
    id: 'berserk',
    title: 'Berserk',
    oneLineSummary: 'The Eclipse continues to haunt Guts.',
    progressChapter: 374,
    progressRatio: 0.88,
    status: 'UPDATED',
    updatedAgoLabel: '1d ago',
    coverColor: '#0f172a',
    coverAccent: '#475569',
    coverText: 'BE',
    collection: 'library',
  },
];

const recentlyViewed: RecentlyViewedComic[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    chapterLabel: 'Ch. 1098',
    coverColor: '#0ea5e9',
    coverAccent: '#bae6fd',
    coverText: 'OP',
  },
  {
    id: 'berserk',
    title: 'Berserk',
    chapterLabel: 'Ch. 374',
    coverColor: '#0f172a',
    coverAccent: '#475569',
    coverText: 'BE',
  },
];

test('hasInlineSearchQuery 仅在输入非空白时返回 true', () => {
  assert.equal(hasInlineSearchQuery(''), false);
  assert.equal(hasInlineSearchQuery('   '), false);
  assert.equal(hasInlineSearchQuery('op'), true);
});

test('filterHomeComicsByInlineQuery 按标题或摘要关键词筛选', () => {
  assert.deepEqual(
    filterHomeComicsByInlineQuery(comics, 'piece').map((item) => item.id),
    ['one-piece'],
  );
  assert.deepEqual(
    filterHomeComicsByInlineQuery(comics, 'eclipse').map((item) => item.id),
    ['berserk'],
  );
});

test('filterHomeComicsByInlineQuery 在空查询时返回原列表', () => {
  assert.deepEqual(filterHomeComicsByInlineQuery(comics, '   '), comics);
});

test('filterRecentlyViewedComicsByInlineQuery 支持标题和章节匹配', () => {
  assert.deepEqual(
    filterRecentlyViewedComicsByInlineQuery(recentlyViewed, 'one').map((item) => item.id),
    ['one-piece'],
  );
  assert.deepEqual(
    filterRecentlyViewedComicsByInlineQuery(recentlyViewed, '374').map((item) => item.id),
    ['berserk'],
  );
});
