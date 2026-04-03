import assert from 'node:assert/strict';
import test from 'node:test';

import { SeriesDetail } from '../../series/domain/series';
import { sortLibrarySeriesByOpenedAt, type LibrarySortOrder } from './librarySeriesSort';

const buildSeries = (id: string, title: string): SeriesDetail => ({
  id,
  title,
  lastReadChapterNumber: '0',
  chapters: [],
});

const sortIds = (
  order: LibrarySortOrder,
  openedAtBySeriesId: Record<string, string | undefined>,
): string[] => {
  const seriesList: SeriesDetail[] = [
    buildSeries('a', '阿尔法'),
    buildSeries('b', '贝塔'),
    buildSeries('c', '伽马'),
    buildSeries('d', '德尔塔'),
  ];

  return sortLibrarySeriesByOpenedAt(seriesList, openedAtBySeriesId, order).map((item) => item.id);
};

test('sortLibrarySeriesByOpenedAt 支持由近到远排序', () => {
  const ids = sortIds('recent_first', {
    b: '2026-04-03T01:00:00.000Z',
    a: '2026-04-03T03:00:00.000Z',
    c: '2026-04-03T02:00:00.000Z',
  });

  assert.deepEqual(ids, ['a', 'c', 'b', 'd']);
});

test('sortLibrarySeriesByOpenedAt 支持由远到近排序', () => {
  const ids = sortIds('oldest_first', {
    b: '2026-04-03T01:00:00.000Z',
    a: '2026-04-03T03:00:00.000Z',
    c: '2026-04-03T02:00:00.000Z',
  });

  assert.deepEqual(ids, ['b', 'c', 'a', 'd']);
});
