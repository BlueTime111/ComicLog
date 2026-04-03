import assert from 'node:assert/strict';
import test from 'node:test';

import { SummaryPack } from '../../../features/import/domain/summaryPack';
import { SqliteImportRepository } from './SqliteImportRepository';
import { SqliteSeriesRepository } from './SqliteSeriesRepository';
import { SqliteDatabaseLike } from './types';

type SeriesRow = {
  id: string;
  title: string;
  last_read_chapter_number: string;
};

type ChapterRow = {
  id: string;
  series_id: string;
  number: string;
  title: string;
  one_line_summary: string;
  private_note: string | null;
  private_tags_json: string | null;
  is_read: number;
  chapter_order: number;
};

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
  public readonly seriesRows: SeriesRow[] = [
    { id: 'one-piece', title: 'One Piece', last_read_chapter_number: '1098' },
  ];

  public readonly chapterRows: ChapterRow[] = [
    {
      id: 'op-1098',
      series_id: 'one-piece',
      number: '1098',
      title: 'Awakening Echo',
      one_line_summary: 'Existing summary',
      private_note: 'Keep this private note',
      private_tags_json: '["战斗"]',
      is_read: 1,
      chapter_order: 1,
    },
  ];

  public readonly importLogRows: ImportLogRow[] = [];
  public readonly seriesActivityRows: {
    series_id: string;
    updated_at: string;
    update_source: 'edit' | 'import';
  }[] = [];

  public shouldFailOnImportLogInsert = false;
  private transactionSnapshot: {
    seriesRows: SeriesRow[];
    chapterRows: ChapterRow[];
    importLogRows: ImportLogRow[];
    seriesActivityRows: {
      series_id: string;
      updated_at: string;
      update_source: 'edit' | 'import';
    }[];
  } | null = null;

  async execAsync(sql: string): Promise<void> {
    if (sql.includes('BEGIN TRANSACTION')) {
      this.transactionSnapshot = {
        seriesRows: this.seriesRows.map((row) => ({ ...row })),
        chapterRows: this.chapterRows.map((row) => ({ ...row })),
        importLogRows: this.importLogRows.map((row) => ({ ...row })),
        seriesActivityRows: this.seriesActivityRows.map((row) => ({ ...row })),
      };
      return;
    }

    if (sql.includes('ROLLBACK') && this.transactionSnapshot) {
      this.seriesRows.length = 0;
      this.seriesRows.push(...this.transactionSnapshot.seriesRows.map((row) => ({ ...row })));

      this.chapterRows.length = 0;
      this.chapterRows.push(...this.transactionSnapshot.chapterRows.map((row) => ({ ...row })));

      this.importLogRows.length = 0;
      this.importLogRows.push(...this.transactionSnapshot.importLogRows.map((row) => ({ ...row })));

      this.seriesActivityRows.length = 0;
      this.seriesActivityRows.push(...this.transactionSnapshot.seriesActivityRows.map((row) => ({ ...row })));
      this.transactionSnapshot = null;
      return;
    }

    if (sql.includes('COMMIT')) {
      this.transactionSnapshot = null;
    }
  }

  async runAsync(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
    if (sql.includes('INSERT INTO series_activity')) {
      const [seriesId, updatedAt, updateSource] = params as [string, string, 'edit' | 'import'];
      const existing = this.seriesActivityRows.find((row) => row.series_id === seriesId);
      if (existing) {
        existing.updated_at = updatedAt;
        existing.update_source = updateSource;
      } else {
        this.seriesActivityRows.unshift({
          series_id: seriesId,
          updated_at: updatedAt,
          update_source: updateSource,
        });
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (sql.includes('INSERT INTO series')) {
      const [id, title, lastRead] = params as [string, string, string];
      this.seriesRows.push({ id, title, last_read_chapter_number: lastRead });
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (sql.includes('UPDATE series SET last_read_chapter_number')) {
      const [lastRead, id] = params as [string, string];
      const target = this.seriesRows.find((row) => row.id === id);
      if (target) {
        target.last_read_chapter_number = lastRead;
      }
      return { changes: target ? 1 : 0, lastInsertRowId: 0 };
    }

    if (sql.includes('INSERT INTO chapters')) {
      const [id, seriesId, number, title, summary, isRead, chapterOrder] = params as [
        string,
        string,
        string,
        string,
        string,
        number,
        number,
      ];
      this.chapterRows.push({
        id,
        series_id: seriesId,
        number,
        title,
        one_line_summary: summary,
        private_note: null,
        private_tags_json: null,
        is_read: isRead,
        chapter_order: chapterOrder,
      });
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (sql.includes('DELETE FROM chapters') && sql.includes('WHERE series_id = ?;')) {
      const [seriesId] = params as [string];
      const before = this.chapterRows.length;
      const next = this.chapterRows.filter((row) => row.series_id !== seriesId);
      this.chapterRows.length = 0;
      this.chapterRows.push(...next);
      return { changes: before - next.length, lastInsertRowId: 0 };
    }

    if (sql.includes('UPDATE chapters') && sql.includes('SET one_line_summary')) {
      const [summary, title, chapterId] = params as [string, string, string];
      const target = this.chapterRows.find((row) => row.id === chapterId);
      if (target) {
        target.one_line_summary = summary;
        target.title = title;
      }
      return { changes: target ? 1 : 0, lastInsertRowId: 0 };
    }

    if (sql.includes('INSERT INTO import_logs')) {
      if (this.shouldFailOnImportLogInsert) {
        throw new Error('insert import log failed');
      }

      const [
        id,
        packId,
        seriesId,
        packTitle,
        importedAt,
        strategy,
        addedCount,
        updatedCount,
        conflictCount,
      ] = params as [string, string, string, string, string, string, number, number, number];

      this.importLogRows.unshift({
        id,
        pack_id: packId,
        series_id: seriesId,
        pack_title: packTitle,
        imported_at: importedAt,
        strategy,
        added_count: addedCount,
        updated_count: updatedCount,
        conflict_count: conflictCount,
      });
      return { changes: 1, lastInsertRowId: 1 };
    }

    return { changes: 0, lastInsertRowId: 0 };
  }

  async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
    if (sql.includes('FROM chapters') && sql.includes('WHERE series_id = ?;')) {
      const [seriesId] = params as [string];
      return this.chapterRows
        .filter((row) => row.series_id === seriesId)
        .sort((a, b) => a.chapter_order - b.chapter_order)
        .map((row) => ({ number: row.number, one_line_summary: row.one_line_summary })) as T[];
    }

    if (sql.includes('FROM chapters') && sql.includes('WHERE series_id = ? AND number = ?;')) {
      const [seriesId, number] = params as [string, string];
      return this.chapterRows
        .filter((row) => row.series_id === seriesId && row.number === number)
        .map((row) => ({
          id: row.id,
          title: row.title,
          one_line_summary: row.one_line_summary,
          private_note: row.private_note,
          chapter_order: row.chapter_order,
        })) as T[];
    }

    if (sql.includes('SELECT id') && sql.includes('FROM series') && sql.includes('WHERE id = ?')) {
      const [seriesId] = params as [string];
      return this.seriesRows.filter((row) => row.id === seriesId).map((row) => ({ id: row.id })) as T[];
    }

    if (sql.includes('SELECT id') && sql.includes('FROM series') && sql.includes('LOWER(title) = LOWER(?)')) {
      const [title] = params as [string];
      const normalized = title.trim().toLowerCase();
      return this.seriesRows
        .filter((row) => row.title.trim().toLowerCase() === normalized)
        .map((row) => ({ id: row.id })) as T[];
    }

    if (sql.includes('FROM import_logs')) {
      return this.importLogRows as T[];
    }

    if (sql.includes('FROM series_activity')) {
      return this.seriesActivityRows as T[];
    }

    return [];
  }
}

const samplePack: SummaryPack = {
  schemaVersion: '1.0',
  series: { id: 'one-piece', title: 'One Piece' },
  pack: {
    packId: 'pack_v2',
    title: 'One Piece V2',
    author: 'editor',
    version: 2,
    updatedAt: '2026-04-01T12:00:00Z',
    coverage: { start: '1', end: '1100' },
  },
  chapters: [
    { number: '1098', title: 'Awakening Echo', summary: 'Incoming updated summary' },
    { number: '1100', title: 'Aftershock', summary: 'Brand new summary' },
  ],
};

test('SqliteImportRepository.previewPack 返回差异与冲突明细', async () => {
  const db = new FakeSqliteDatabase();
  const repository = new SqliteImportRepository(db);

  const preview = await repository.previewPack(samplePack);

  assert.equal(preview.addedCount, 1);
  assert.equal(preview.updatedCount, 1);
  assert.equal(preview.conflictCount, 1);
  assert.equal(preview.conflictChapters.length, 1);
  assert.equal(preview.conflictChapters[0]?.number, '1098');
});

test('SqliteImportRepository.applyPack 在 missingOnly 下仅新增缺失章节', async () => {
  const db = new FakeSqliteDatabase();
  const repository = new SqliteImportRepository(db);

  const result = await repository.applyPack(samplePack, 'missingOnly');

  assert.equal(result.addedCount, 1);
  assert.equal(result.updatedCount, 0);
  assert.equal(db.chapterRows.find((row) => row.number === '1098')?.one_line_summary, 'Existing summary');
  assert.equal(db.chapterRows.find((row) => row.number === '1100')?.one_line_summary, 'Brand new summary');
});

test('SqliteImportRepository.applyPack 在 manual/useIncoming 下更新冲突章节并保留私人备注计数', async () => {
  const db = new FakeSqliteDatabase();
  const repository = new SqliteImportRepository(db);

  const result = await repository.applyPack(samplePack, 'manual', [
    { number: '1098', resolution: 'useIncoming' },
  ]);

  assert.equal(result.updatedCount, 1);
  assert.equal(result.preservedPrivateCount, 1);
  assert.equal(db.chapterRows.find((row) => row.number === '1098')?.one_line_summary, 'Incoming updated summary');
});

test('SqliteImportRepository.listImportLogs 返回导入日志', async () => {
  const db = new FakeSqliteDatabase();
  const repository = new SqliteImportRepository(db);

  await repository.applyPack(samplePack, 'overwriteShared');
  const logs = await repository.listImportLogs();

  assert.equal(logs.length, 1);
  assert.equal(logs[0]?.packId, 'pack_v2');
  assert.equal(logs[0]?.strategy, 'overwriteShared');
});

test('SqliteImportRepository.applyPack 后可在 SqliteSeriesRepository 读到最近更新活动', async () => {
  const db = new FakeSqliteDatabase();
  const importRepository = new SqliteImportRepository(db);
  const seriesRepository = new SqliteSeriesRepository(db);

  await importRepository.applyPack(samplePack, 'overwriteShared');
  const updated = await seriesRepository.listRecentlyUpdatedSeries();

  assert.equal(updated.length, 1);
  assert.equal(updated[0]?.seriesId, 'one-piece');
  assert.equal(updated[0]?.source, 'import');
});

test('SqliteImportRepository.applyPack 失败时回滚事务，避免部分写入', async () => {
  const db = new FakeSqliteDatabase();
  db.shouldFailOnImportLogInsert = true;
  const repository = new SqliteImportRepository(db);

  await assert.rejects(() => repository.applyPack(samplePack, 'overwriteShared'));

  assert.equal(db.seriesRows.find((row) => row.id === 'one-piece')?.last_read_chapter_number, '1098');
  assert.equal(db.chapterRows.find((row) => row.number === '1098')?.one_line_summary, 'Existing summary');
  assert.equal(db.chapterRows.some((row) => row.number === '1100'), false);
  assert.equal(db.importLogRows.length, 0);
  assert.equal(db.seriesActivityRows.length, 0);
});

test('SqliteImportRepository 在 series.id 不匹配时创建新作品而不是按标题合并', async () => {
  const db = new FakeSqliteDatabase();
  const repository = new SqliteImportRepository(db);

  const idMismatchedPack: SummaryPack = {
    ...samplePack,
    series: {
      id: 'series',
      title: 'One Piece',
    },
  };

  const result = await repository.applyPack(idMismatchedPack, 'missingOnly');

  assert.equal(result.addedCount, 2);
  assert.equal(db.seriesRows.some((row) => row.id === 'series'), true);
  assert.equal(db.chapterRows.some((row) => row.series_id === 'series' && row.number === '1098'), true);
  assert.equal(db.chapterRows.some((row) => row.series_id === 'series' && row.number === '1100'), true);
});

test('SqliteImportRepository 在目标作品已删除但残留孤儿章节时仍按新增处理', async () => {
  const db = new FakeSqliteDatabase();
  const repository = new SqliteImportRepository(db);

  const orphanPack: SummaryPack = {
    schemaVersion: '1.0',
    series: { id: 'series', title: 'Naruto' },
    pack: {
      packId: 'pack_naruto_v1',
      title: 'Naruto Shared Pack',
      author: 'local-user',
      version: 1,
      updatedAt: '2026-04-02T08:00:00Z',
      coverage: { start: '100', end: '20' },
    },
    chapters: [
      { number: '100', title: 'I am not Naruto', summary: '' },
      { number: '20', title: 'Jiraiya', summary: '' },
    ],
  };

  db.chapterRows.push({
    id: 'series-100',
    series_id: 'series',
    number: '100',
    title: 'Old orphan title',
    one_line_summary: '',
    private_note: null,
    private_tags_json: null,
    is_read: 0,
    chapter_order: 1,
  });

  const preview = await repository.previewPack(orphanPack);
  assert.equal(preview.addedCount, 2);

  const result = await repository.applyPack(orphanPack, 'missingOnly');
  assert.equal(result.addedCount, 2);
  assert.equal(db.seriesRows.some((row) => row.id === 'series'), true);
  assert.equal(db.chapterRows.filter((row) => row.series_id === 'series').length, 2);
});
