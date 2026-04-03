import assert from 'node:assert/strict';
import test from 'node:test';

import { SqliteImportLogRepository } from './SqliteImportLogRepository';
import { SqliteDatabaseLike } from './types';

type ImportLogRow = {
  id: string;
  pack_id: string;
  series_id: string;
  pack_title: string;
  imported_at: string;
  strategy: string;
  added_count: number;
  updated_count: number;
  conflict_count: number;
};

class FakeSqliteDatabase implements SqliteDatabaseLike {
  constructor(private readonly rows: ImportLogRow[]) {}

  async execAsync(): Promise<void> {}

  async runAsync(): Promise<{ changes: number; lastInsertRowId: number }> {
    return { changes: 0, lastInsertRowId: 0 };
  }

  async getAllAsync<T>(): Promise<T[]> {
    return this.rows as T[];
  }
}

test('SqliteImportLogRepository.listImportLogs 返回导入日志并保持倒序', async () => {
  const db = new FakeSqliteDatabase([
    {
      id: 'log-2',
      pack_id: 'pack_v2',
      series_id: 'one-piece',
      pack_title: 'Pack V2',
      imported_at: '2026-04-01T10:00:00Z',
      strategy: 'manual',
      added_count: 2,
      updated_count: 1,
      conflict_count: 1,
    },
    {
      id: 'log-1',
      pack_id: 'pack_v1',
      series_id: 'one-piece',
      pack_title: 'Pack V1',
      imported_at: '2026-03-31T10:00:00Z',
      strategy: 'missingOnly',
      added_count: 1,
      updated_count: 0,
      conflict_count: 0,
    },
  ]);

  const repository = new SqliteImportLogRepository(db);
  const logs = await repository.listImportLogs();

  assert.equal(logs.length, 2);
  assert.equal(logs[0]?.id, 'log-2');
  assert.equal(logs[0]?.strategy, 'manual');
  assert.equal(logs[1]?.id, 'log-1');
});
