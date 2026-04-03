import assert from 'node:assert/strict';
import test from 'node:test';

import { SqliteSeriesRepository } from './SqliteSeriesRepository';
import { SqliteDatabaseLike } from './types';

type SeriesRow = {
  series_id: string;
  series_title: string;
  series_last_read_chapter_number: string;
  chapter_id: string | null;
  chapter_number: string | null;
  chapter_title: string | null;
  chapter_summary: string | null;
  chapter_private_note: string | null;
  chapter_private_tags_json: string | null;
  chapter_is_read: number | null;
};

class FakeSqliteDatabase implements SqliteDatabaseLike {
  public readonly execCalls: string[] = [];
  public readonly updatedSeries: { seriesId: string; updatedAt: string; source: 'edit' | 'import' }[] = [];
  public readonly openedSeries: { seriesId: string; openedAt: string }[] = [];

  constructor(
    private readonly listRows: SeriesRow[],
    private readonly detailRowsBySeriesId: Record<string, SeriesRow[]>,
  ) {}

  async execAsync(sql: string): Promise<void> {
    this.execCalls.push(sql);
  }

  async getAllAsync<T>(_: string, ...params: unknown[]): Promise<T[]> {
    if (_.includes('PRAGMA table_info(series_activity)')) {
      return [
        { name: 'series_id' },
        { name: 'updated_at' },
        { name: 'update_source' },
      ] as T[];
    }

    if (_.includes('FROM series_activity')) {
      return this.updatedSeries.map((item) => ({
        series_id: item.seriesId,
        updated_at: item.updatedAt,
        update_source: item.source,
      })) as T[];
    }

    if (_.includes('FROM series_opened')) {
      return this.openedSeries
        .map((item) => ({
          series_id: item.seriesId,
          opened_at: item.openedAt,
        }))
        .sort((a, b) => b.opened_at.localeCompare(a.opened_at)) as T[];
    }

    if (_.includes('SELECT id') && _.includes('FROM series')) {
      const id = String(params[0] ?? '');
      const hasId = this.listRows.some((row) => row.series_id === id);
      return hasId ? ([{ id }] as T[]) : [];
    }

    if (_.includes('MAX(chapter_order)')) {
      const seriesId = String(params[0] ?? '');
      const orders = this.listRows
        .filter((row) => row.series_id === seriesId)
        .map((row) => Number(row.chapter_id ? row.chapter_number : 0));
      const maxOrder = orders.length > 0 ? orders.length : 0;
      return [{ max_order: maxOrder }] as T[];
    }

    if (_.includes('SELECT') && _.includes('s.id AS series_id') && _.includes('FROM chapters c') && _.includes('LIKE ?')) {
      const keyword = String(params[0] ?? '')
        .replace(/^%/, '')
        .replace(/%$/, '')
        .toLowerCase();

      return this.listRows
        .filter((row) => {
          if (!row.chapter_id || !row.chapter_number || !row.chapter_title) {
            return false;
          }

          return [
            row.series_title,
            row.chapter_number,
            row.chapter_title,
            row.chapter_summary ?? '',
            row.chapter_private_tags_json ?? '',
          ].some((value) => value.toLowerCase().includes(keyword));
        })
        .map((row) => ({
          series_id: row.series_id,
          series_title: row.series_title,
          chapter_id: row.chapter_id,
          chapter_number: row.chapter_number,
          chapter_title: row.chapter_title,
          chapter_summary: row.chapter_summary ?? '',
          chapter_private_tags_json: row.chapter_private_tags_json,
        })) as T[];
    }

    if (params.length === 0) {
      return this.listRows as T[];
    }

    const seriesId = String(params[0]);
    const fromDetailRows = this.detailRowsBySeriesId[seriesId] ?? [];
    if (fromDetailRows.length > 0) {
      return fromDetailRows as T[];
    }

    return this.listRows.filter((row) => row.series_id === seriesId) as T[];
  }

  async runAsync(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
    if (sql.includes('INSERT INTO series (id, title, last_read_chapter_number)')) {
      const [id, title, lastRead] = params as [string, string, string];
      this.listRows.push({
        series_id: id,
        series_title: title,
        series_last_read_chapter_number: lastRead,
        chapter_id: null,
        chapter_number: null,
        chapter_title: null,
        chapter_summary: null,
        chapter_private_note: null,
        chapter_private_tags_json: null,
        chapter_is_read: null,
      });
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (sql.includes('INSERT INTO chapters')) {
      const [
        id,
        seriesId,
        number,
        title,
        oneLineSummary,
        privateNote,
        isRead,
      ] = params as [string, string, string, string, string, string | null, number, number];

      const row: SeriesRow = {
        series_id: seriesId,
        series_title: this.listRows.find((item) => item.series_id === seriesId)?.series_title ?? 'Unknown',
        series_last_read_chapter_number:
          this.listRows.find((item) => item.series_id === seriesId)?.series_last_read_chapter_number ?? '0',
        chapter_id: id,
        chapter_number: number,
        chapter_title: title,
        chapter_summary: oneLineSummary,
        chapter_private_note: privateNote,
        chapter_private_tags_json: null,
        chapter_is_read: isRead,
      };

      this.listRows.push(row);
      if (!this.detailRowsBySeriesId[seriesId]) {
        this.detailRowsBySeriesId[seriesId] = [];
      }
      this.detailRowsBySeriesId[seriesId]?.push({ ...row });

      return { changes: 1, lastInsertRowId: 0 };
    }

    if (sql.includes('UPDATE series') && sql.includes('SET title = COALESCE')) {
      const [title, seriesId] = params as [string | null, string];
      let changed = 0;
      const nextTitle = title?.trim();
      if (!nextTitle) {
        return { changes: 0, lastInsertRowId: 0 };
      }

      for (const row of this.listRows) {
        if (row.series_id === seriesId) {
          row.series_title = nextTitle;
          changed = 1;
        }
      }

      for (const row of this.detailRowsBySeriesId[seriesId] ?? []) {
        row.series_title = nextTitle;
      }

      return { changes: changed, lastInsertRowId: 0 };
    }

    if (sql.includes('UPDATE series') && sql.includes('SET last_read_chapter_number')) {
      const [chapterNumber, seriesId] = params as [string, string];
      let changed = 0;
      for (const row of this.listRows) {
        if (row.series_id === seriesId) {
          row.series_last_read_chapter_number = chapterNumber;
          changed = 1;
        }
      }

      for (const row of this.detailRowsBySeriesId[seriesId] ?? []) {
        row.series_last_read_chapter_number = chapterNumber;
      }

      return { changes: changed, lastInsertRowId: 0 };
    }

    if (sql.includes('DELETE FROM series_activity')) {
      const [seriesId] = params as [string];
      const index = this.updatedSeries.findIndex((item) => item.seriesId === seriesId);
      if (index >= 0) {
        this.updatedSeries.splice(index, 1);
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (sql.includes('DELETE FROM series_opened')) {
      const [seriesId] = params as [string];
      const index = this.openedSeries.findIndex((item) => item.seriesId === seriesId);
      if (index >= 0) {
        this.openedSeries.splice(index, 1);
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (sql.includes('DELETE FROM series')) {
      const [seriesId] = params as [string];
      const beforeLength = this.listRows.length;

      for (let i = this.listRows.length - 1; i >= 0; i -= 1) {
        if (this.listRows[i]?.series_id === seriesId) {
          this.listRows.splice(i, 1);
        }
      }

      delete this.detailRowsBySeriesId[seriesId];

      return { changes: beforeLength === this.listRows.length ? 0 : 1, lastInsertRowId: 0 };
    }

    if (sql.includes('INSERT INTO series_activity')) {
      const [seriesId, updatedAt, updateSource] = params as [string, string, 'edit' | 'import'];
      const existing = this.updatedSeries.find((item) => item.seriesId === seriesId);
      if (existing) {
        existing.updatedAt = updatedAt;
        existing.source = updateSource;
      } else {
        this.updatedSeries.unshift({ seriesId, updatedAt, source: updateSource });
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (sql.includes('INSERT INTO series_opened')) {
      const [seriesId, openedAt] = params as [string, string];
      const existing = this.openedSeries.find((item) => item.seriesId === seriesId);
      if (existing) {
        existing.openedAt = openedAt;
      } else {
        this.openedSeries.unshift({ seriesId, openedAt });
      }
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (sql.includes('UPDATE chapters') && sql.includes('WHERE id = ?')) {
      const [summary, shouldUpdatePrivateNote, privateNote, chapterId, seriesId] = params as [
        string | null,
        number,
        string | null,
        string,
        string,
      ];

      for (const row of this.listRows) {
        if (row.chapter_id === chapterId && row.series_id === seriesId) {
          if (summary !== null) {
            row.chapter_summary = summary;
          }

          if (shouldUpdatePrivateNote === 1) {
            row.chapter_private_note = privateNote;
          }
        }
      }

      for (const seriesRows of Object.values(this.detailRowsBySeriesId)) {
        for (const row of seriesRows) {
          if (row.chapter_id === chapterId && row.series_id === seriesId) {
            if (summary !== null) {
              row.chapter_summary = summary;
            }

            if (shouldUpdatePrivateNote === 1) {
              row.chapter_private_note = privateNote;
            }
          }
        }
      }

      return { changes: 1, lastInsertRowId: 0 };
    }

    return { changes: 0, lastInsertRowId: 0 };
  }
}

const listRows: SeriesRow[] = [
  {
    series_id: 'one-piece',
    series_title: 'One Piece',
    series_last_read_chapter_number: '1098',
    chapter_id: 'op-1098',
    chapter_number: '1098',
    chapter_title: 'Awakening Echo',
    chapter_summary: 'Shared summary A',
    chapter_private_note: 'Private note A',
    chapter_private_tags_json: '["战斗"]',
    chapter_is_read: 1,
  },
  {
    series_id: 'one-piece',
    series_title: 'One Piece',
    series_last_read_chapter_number: '1098',
    chapter_id: 'op-1099',
    chapter_number: '1099',
    chapter_title: 'Unseen Tide',
    chapter_summary: 'Shared summary B',
    chapter_private_note: null,
    chapter_private_tags_json: null,
    chapter_is_read: 0,
  },
  {
    series_id: 'vinland-saga',
    series_title: 'Vinland Saga',
    series_last_read_chapter_number: '209',
    chapter_id: 'vs-209',
    chapter_number: '209',
    chapter_title: 'Silent Coast',
    chapter_summary: 'Shared summary C',
    chapter_private_note: null,
    chapter_private_tags_json: '["人物"]',
    chapter_is_read: 1,
  },
];

test('SqliteSeriesRepository.listSeriesDetails 将行数据聚合为作品详情', async () => {
  const db = new FakeSqliteDatabase(listRows, {});
  const repository = new SqliteSeriesRepository(db);

  const details = await repository.listSeriesDetails();

  assert.equal(details.length, 2);
  assert.equal(details[0]?.id, 'one-piece');
  assert.equal(details[0]?.chapters.length, 2);
  assert.equal(details[0]?.chapters[0]?.id, 'op-1098');
  assert.equal(details[0]?.chapters[0]?.privateTags?.[0], '战斗');
  assert.equal(details[1]?.id, 'vinland-saga');
});

test('SqliteSeriesRepository.getSeriesDetail 未命中时返回 null', async () => {
  const db = new FakeSqliteDatabase([], {});
  const repository = new SqliteSeriesRepository(db);

  const detail = await repository.getSeriesDetail('unknown-series');

  assert.equal(detail, null);
});

test('SqliteSeriesRepository.initialize 执行 schema 迁移 SQL', async () => {
  const db = new FakeSqliteDatabase([], {});
  const repository = new SqliteSeriesRepository(db);

  await repository.initialize();

  assert.ok(db.execCalls.length > 0);
  assert.ok(db.execCalls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS series')));
  assert.ok(db.execCalls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS chapters')));
  assert.ok(db.execCalls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS app_meta')));
  assert.ok(db.execCalls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS series_activity')));
  assert.ok(db.execCalls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS series_opened')));
});

test('SqliteSeriesRepository.updateChapterSummary 更新共享层与私人层内容', async () => {
  const detailRows: Record<string, SeriesRow[]> = {
    'one-piece': listRows.filter((row) => row.series_id === 'one-piece').map((row) => ({ ...row })),
  };
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), detailRows);
  const repository = new SqliteSeriesRepository(db);

  const changed = await repository.updateChapterSummary('one-piece', 'op-1098', {
    oneLineSummary: 'Edited by sqlite',
    privateNote: 'Private updated',
  });

  const detail = await repository.getSeriesDetail('one-piece');
  const chapter = detail?.chapters.find((item) => item.id === 'op-1098');

  assert.equal(changed, true);
  assert.equal(chapter?.oneLineSummary, 'Edited by sqlite');
  assert.equal(chapter?.privateNote, 'Private updated');

  const updatedSeries = await repository.listRecentlyUpdatedSeries();
  assert.equal(updatedSeries[0]?.seriesId, 'one-piece');
  assert.equal(typeof updatedSeries[0]?.updatedAt, 'string');
  assert.equal(updatedSeries[0]?.source, 'edit');
});

test('SqliteSeriesRepository 可记录并读取作品最近打开时间', async () => {
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), {});
  const repository = new SqliteSeriesRepository(db);

  const before = await repository.listSeriesLastOpened();
  await repository.markSeriesOpened('one-piece', '2026-04-03T07:00:00.000Z');
  const after = await repository.listSeriesLastOpened();

  assert.equal(before.length, 0);
  assert.equal(after[0]?.seriesId, 'one-piece');
  assert.equal(after[0]?.openedAt, '2026-04-03T07:00:00.000Z');
});

test('SqliteSeriesRepository.createSeries 可新增作品', async () => {
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), {});
  const repository = new SqliteSeriesRepository(db);

  const created = await repository.createSeries({
    title: 'Dandadan',
    lastReadChapterNumber: '1',
  });

  const detail = await repository.getSeriesDetail(created.id);

  assert.equal(created.title, 'Dandadan');
  assert.equal(created.lastReadChapterNumber, '1');
  assert.equal(detail?.title, 'Dandadan');
  assert.match(created.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('SqliteSeriesRepository.createSeries 同名作品使用不同 UUID', async () => {
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), {});
  const repository = new SqliteSeriesRepository(db);

  const first = await repository.createSeries({ title: '火影忍者' });
  const second = await repository.createSeries({ title: '火影忍者' });

  assert.notEqual(first.id, second.id);
});

test('SqliteSeriesRepository.updateSeries 可更新标题', async () => {
  const detailRows: Record<string, SeriesRow[]> = {
    'one-piece': listRows.filter((row) => row.series_id === 'one-piece').map((row) => ({ ...row })),
  };
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), detailRows);
  const repository = new SqliteSeriesRepository(db);

  const changed = await repository.updateSeries('one-piece', {
    title: 'One Piece Reloaded',
  });
  const detail = await repository.getSeriesDetail('one-piece');

  assert.equal(changed, true);
  assert.equal(detail?.title, 'One Piece Reloaded');
});

test('SqliteSeriesRepository.setLastReadChapterNumber 可更新进度', async () => {
  const detailRows: Record<string, SeriesRow[]> = {
    'one-piece': listRows.filter((row) => row.series_id === 'one-piece').map((row) => ({ ...row })),
  };
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), detailRows);
  const repository = new SqliteSeriesRepository(db);

  const changed = await repository.setLastReadChapterNumber('one-piece', '1097');
  const detail = await repository.getSeriesDetail('one-piece');

  assert.equal(changed, true);
  assert.equal(detail?.lastReadChapterNumber, '1097');
});

test('SqliteSeriesRepository.deleteSeries 可删除作品', async () => {
  const detailRows: Record<string, SeriesRow[]> = {
    'one-piece': listRows.filter((row) => row.series_id === 'one-piece').map((row) => ({ ...row })),
  };
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), detailRows);
  const repository = new SqliteSeriesRepository(db);

  const deleted = await repository.deleteSeries('one-piece');
  const detail = await repository.getSeriesDetail('one-piece');

  assert.equal(deleted, true);
  assert.equal(detail, null);
});

test('SqliteSeriesRepository.createChapter 可新增章节并支持非整数章节号', async () => {
  const detailRows: Record<string, SeriesRow[]> = {
    'one-piece': listRows.filter((row) => row.series_id === 'one-piece').map((row) => ({ ...row })),
  };
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), detailRows);
  const repository = new SqliteSeriesRepository(db);

  const chapterId = await repository.createChapter('one-piece', {
    number: '番外-1',
    title: 'Special Side Story',
    privateNote: 'A side story chapter.',
    isRead: true,
  });
  const detail = await repository.getSeriesDetail('one-piece');
  const created = detail?.chapters.find((chapter) => chapter.id === chapterId);

  assert.equal(typeof chapterId, 'string');
  assert.equal(created?.number, '番外-1');
  assert.equal(created?.title, 'Special Side Story');
  assert.equal(created?.oneLineSummary, '');
  assert.equal(created?.privateNote, 'A side story chapter.');
  assert.equal(created?.isRead, true);
});

test('SqliteSeriesRepository.searchReadSummaries 返回所有章节并标记命中字段', async () => {
  const db = new FakeSqliteDatabase(listRows.map((row) => ({ ...row })), {});
  const repository = new SqliteSeriesRepository(db);

  const titleResults = await repository.searchReadSummaries('vinland');
  const tagResults = await repository.searchReadSummaries('战斗');
  const unreadResults = await repository.searchReadSummaries('1099');

  assert.equal(titleResults[0]?.chapterId, 'vs-209');
  assert.deepEqual(titleResults[0]?.matchedFields, ['seriesTitle']);
  assert.equal(tagResults[0]?.chapterId, 'op-1098');
  assert.deepEqual(tagResults[0]?.matchedFields, ['tag']);
  // 未读章节也可被搜索
  assert.equal(unreadResults.length, 1);
  assert.equal(unreadResults[0]?.chapterId, 'op-1099');
});
