import assert from 'node:assert/strict';
import test from 'node:test';

import { seriesDetails } from '../../mock/seriesData';
import { seedSqliteFromMockData, shouldSeedSqliteFromMock } from './seedFromMock';
import { SqliteDatabaseLike } from './types';

class FakeSqliteDatabase implements SqliteDatabaseLike {
  public insertedSeries = 0;
  public insertedChapters = 0;
  public upsertedSeedMarker = 0;

  constructor(
    private readonly existingSeriesCount: number,
    private readonly seedMarkerValue: string | null = null,
  ) {}

  async execAsync(): Promise<void> {}

  async runAsync(sql: string): Promise<{ changes: number; lastInsertRowId: number }> {
    if (sql.includes('INSERT OR REPLACE INTO series')) {
      this.insertedSeries += 1;
    }

    if (sql.includes('INSERT OR REPLACE INTO chapters')) {
      this.insertedChapters += 1;
    }

    if (sql.includes('INSERT OR REPLACE INTO app_meta')) {
      this.upsertedSeedMarker += 1;
    }

    return { changes: 1, lastInsertRowId: 1 };
  }

  async getAllAsync<T>(sql: string): Promise<T[]> {
    if (sql.includes('SELECT value FROM app_meta WHERE key = ?')) {
      if (this.seedMarkerValue === null) {
        return [];
      }

      return [{ value: this.seedMarkerValue }] as T[];
    }

    if (sql.includes('SELECT COUNT(*) AS count FROM series')) {
      return [{ count: this.existingSeriesCount }] as T[];
    }

    return [];
  }
}

test('seedSqliteFromMockData 在空库时写入 mock 数据', async () => {
  const db = new FakeSqliteDatabase(0);

  const result = await seedSqliteFromMockData(db);

  const expectedChapterCount = seriesDetails.reduce((sum, series) => sum + series.chapters.length, 0);

  assert.equal(result.seeded, true);
  assert.equal(db.insertedSeries, seriesDetails.length);
  assert.equal(db.insertedChapters, expectedChapterCount);
  assert.equal(db.upsertedSeedMarker, 1);
});

test('seedSqliteFromMockData 在已有数据但无 seed 标记时跳过写入并补写标记', async () => {
  const db = new FakeSqliteDatabase(1);

  const result = await seedSqliteFromMockData(db);

  assert.equal(result.seeded, false);
  assert.equal(db.insertedSeries, 0);
  assert.equal(db.insertedChapters, 0);
  assert.equal(db.upsertedSeedMarker, 1);
});

test('seedSqliteFromMockData 在已有 seed 标记时直接跳过', async () => {
  const db = new FakeSqliteDatabase(0, 'mock_seed_v1');

  const result = await seedSqliteFromMockData(db);

  assert.equal(result.seeded, false);
  assert.equal(db.insertedSeries, 0);
  assert.equal(db.insertedChapters, 0);
  assert.equal(db.upsertedSeedMarker, 0);
});

test('shouldSeedSqliteFromMock 默认返回 true', () => {
  assert.equal(shouldSeedSqliteFromMock(undefined), true);
  assert.equal(shouldSeedSqliteFromMock(''), true);
  assert.equal(shouldSeedSqliteFromMock('on'), true);
});

test('shouldSeedSqliteFromMock 在关闭标记时返回 false', () => {
  assert.equal(shouldSeedSqliteFromMock('off'), false);
  assert.equal(shouldSeedSqliteFromMock('false'), false);
  assert.equal(shouldSeedSqliteFromMock('0'), false);
  assert.equal(shouldSeedSqliteFromMock('no'), false);
});
