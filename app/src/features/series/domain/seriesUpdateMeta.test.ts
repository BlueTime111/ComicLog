import assert from 'node:assert/strict';
import test from 'node:test';

import { SeriesUpdateActivity } from './seriesRepository';
import { buildSeriesUpdateMeta } from './seriesUpdateMeta';

test('buildSeriesUpdateMeta 在无活动时返回暂无记录', () => {
  assert.equal(buildSeriesUpdateMeta(null), '最近更新：暂无记录');
});

test('buildSeriesUpdateMeta 对导入活动返回导入更新文案', () => {
  const activity: SeriesUpdateActivity = {
    seriesId: 'one-piece',
    updatedAt: '2026-03-30T10:00:00.000Z',
    source: 'import',
  };

  const meta = buildSeriesUpdateMeta(activity, () => '2h ago');

  assert.equal(meta, '最近更新：导入更新 · 2h ago');
});

test('buildSeriesUpdateMeta 对编辑活动返回手动编辑文案', () => {
  const activity: SeriesUpdateActivity = {
    seriesId: 'one-piece',
    updatedAt: '2026-03-30T10:00:00.000Z',
    source: 'edit',
  };

  const meta = buildSeriesUpdateMeta(activity, () => '5m ago');

  assert.equal(meta, '最近更新：手动编辑 · 5m ago');
});

test('buildSeriesUpdateMeta 支持英文导入活动文案', () => {
  const activity: SeriesUpdateActivity = {
    seriesId: 'one-piece',
    updatedAt: '2026-03-30T10:00:00.000Z',
    source: 'import',
  };

  const meta = buildSeriesUpdateMeta(activity, () => '2h ago', 'en');

  assert.equal(meta, 'Latest update: Imported · 2h ago');
});

test('buildSeriesUpdateMeta 支持英文无记录文案', () => {
  assert.equal(buildSeriesUpdateMeta(null, undefined, 'en'), 'Latest update: none');
});
