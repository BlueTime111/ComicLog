import { SeriesChapter } from '../../../features/series/domain/recap';
import { SeriesDetail } from '../../../features/series/domain/series';
import {
  SeriesLastOpened,
  SeriesRepository,
  SeriesUpdateActivity,
} from '../../../features/series/domain/seriesRepository';
import { SearchMatchField, SearchResultItem } from '../../../features/search/domain/searchReadSummaries';
import { MIGRATIONS, SQLITE_SCHEMA_SQL } from './schema';
import { SqliteDatabaseLike } from './types';
import { generateUuidV4 } from '../../../utils/uuid';

type SeriesJoinRow = {
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

type SearchRow = {
  series_id: string;
  series_title: string;
  chapter_id: string;
  chapter_number: string;
  chapter_title: string;
  chapter_summary: string;
  chapter_private_tags_json: string | null;
};

const LIST_QUERY = `
SELECT
  s.id AS series_id,
  s.title AS series_title,
  s.last_read_chapter_number AS series_last_read_chapter_number,
  c.id AS chapter_id,
  c.number AS chapter_number,
  c.title AS chapter_title,
  c.one_line_summary AS chapter_summary,
  c.private_note AS chapter_private_note,
  c.private_tags_json AS chapter_private_tags_json,
  c.is_read AS chapter_is_read
FROM series s
LEFT JOIN chapters c ON c.series_id = s.id
ORDER BY s.title ASC, c.chapter_order ASC;
`;

const DETAIL_QUERY = `
SELECT
  s.id AS series_id,
  s.title AS series_title,
  s.last_read_chapter_number AS series_last_read_chapter_number,
  c.id AS chapter_id,
  c.number AS chapter_number,
  c.title AS chapter_title,
  c.one_line_summary AS chapter_summary,
  c.private_note AS chapter_private_note,
  c.private_tags_json AS chapter_private_tags_json,
  c.is_read AS chapter_is_read
FROM series s
LEFT JOIN chapters c ON c.series_id = s.id
WHERE s.id = ?
ORDER BY c.chapter_order ASC;
`;

const SEARCH_READ_SUMMARIES_SQL = `
SELECT
  s.id AS series_id,
  s.title AS series_title,
  c.id AS chapter_id,
  c.number AS chapter_number,
  c.title AS chapter_title,
  c.one_line_summary AS chapter_summary,
  c.private_tags_json AS chapter_private_tags_json
FROM chapters c
INNER JOIN series s ON s.id = c.series_id
WHERE (
    LOWER(s.title) LIKE ?
    OR LOWER(c.number) LIKE ?
    OR LOWER(c.title) LIKE ?
    OR LOWER(c.one_line_summary) LIKE ?
    OR LOWER(COALESCE(c.private_tags_json, '')) LIKE ?
  )
ORDER BY s.title ASC, c.chapter_order ASC;
`;

const FIND_SERIES_ID_SQL = `
SELECT id
FROM series
WHERE id = ?;
`;

const INSERT_SERIES_SQL = `
INSERT INTO series (id, title, last_read_chapter_number)
VALUES (?, ?, ?);
`;

const UPDATE_SERIES_SQL = `
UPDATE series
SET title = COALESCE(?, title)
WHERE id = ?;
`;

const UPDATE_SERIES_LAST_READ_SQL = `
UPDATE series
SET last_read_chapter_number = ?
WHERE id = ?;
`;

const DELETE_SERIES_SQL = `
DELETE FROM series
WHERE id = ?;
`;

const DELETE_CHAPTERS_BY_SERIES_SQL = `
DELETE FROM chapters
WHERE series_id = ?;
`;

const DELETE_SERIES_ACTIVITY_SQL = `
DELETE FROM series_activity
WHERE series_id = ?;
`;

const DELETE_SERIES_OPENED_SQL = `
DELETE FROM series_opened
WHERE series_id = ?;
`;

const SELECT_MAX_CHAPTER_ORDER_SQL = `
SELECT MAX(chapter_order) AS max_order
FROM chapters
WHERE series_id = ?;
`;

const INSERT_CHAPTER_SQL = `
INSERT INTO chapters (
  id,
  series_id,
  number,
  title,
  one_line_summary,
  private_note,
  is_read,
  chapter_order
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

const UPDATE_CHAPTER_SUMMARY_SQL = `
UPDATE chapters
SET
  one_line_summary = COALESCE(?, one_line_summary),
  private_note = CASE WHEN ? = 1 THEN ? ELSE private_note END
WHERE id = ? AND series_id = ?;
`;

const UPDATE_CHAPTER_READ_SQL = `
UPDATE chapters
SET is_read = ?
WHERE id = ? AND series_id = ?;
`;

const UPSERT_SERIES_ACTIVITY_SQL = `
INSERT INTO series_activity (series_id, updated_at, update_source)
VALUES (?, ?, ?)
ON CONFLICT(series_id)
DO UPDATE SET
  updated_at = excluded.updated_at,
  update_source = excluded.update_source;
`;

const LIST_UPDATED_SERIES_IDS_SQL = `
SELECT series_id, updated_at, update_source
FROM series_activity
ORDER BY updated_at DESC;
`;

const UPSERT_SERIES_OPENED_SQL = `
INSERT INTO series_opened (series_id, opened_at)
VALUES (?, ?)
ON CONFLICT(series_id)
DO UPDATE SET
  opened_at = excluded.opened_at;
`;

const LIST_SERIES_OPENED_SQL = `
SELECT series_id, opened_at
FROM series_opened
ORDER BY opened_at DESC;
`;

type UpdatedSeriesRow = {
  series_id: string;
  updated_at: string;
  update_source: string | null;
};

type SeriesOpenedRow = {
  series_id: string;
  opened_at: string;
};

type SqliteIdRow = {
  id: string;
};

type SqliteMigrationRow = {
  id: number;
  name: string;
  applied_at: string;
};

type SqliteMaxOrderRow = {
  max_order: number | null;
};

const toSeriesUpdateSource = (value: string | null): 'edit' | 'import' => {
  return value === 'import' ? 'import' : 'edit';
};

const normalize = (value: string): string => value.trim().toLowerCase();

const includesKeyword = (value: string, keyword: string): boolean => {
  return normalize(value).includes(keyword);
};

const parsePrivateTags = (raw: string | null): string[] | undefined => {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const tags = parsed.filter((item): item is string => typeof item === 'string');
      return tags.length > 0 ? tags : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const mapChapter = (row: SeriesJoinRow): SeriesChapter | null => {
  if (!row.chapter_id || !row.chapter_number || !row.chapter_title || row.chapter_summary === null) {
    return null;
  }

  return {
    id: row.chapter_id,
    number: row.chapter_number,
    title: row.chapter_title,
    oneLineSummary: row.chapter_summary,
    privateNote: row.chapter_private_note ?? undefined,
    privateTags: parsePrivateTags(row.chapter_private_tags_json),
    isRead: row.chapter_is_read === 1,
  };
};

const mapRowsToSeriesDetails = (rows: SeriesJoinRow[]): SeriesDetail[] => {
  const seriesMap = new Map<string, SeriesDetail>();

  for (const row of rows) {
    const existingSeries = seriesMap.get(row.series_id);

    if (!existingSeries) {
      seriesMap.set(row.series_id, {
        id: row.series_id,
        title: row.series_title,
        lastReadChapterNumber: row.series_last_read_chapter_number,
        chapters: [],
      });
    }

    const chapter = mapChapter(row);
    if (chapter) {
      seriesMap.get(row.series_id)?.chapters.push(chapter);
    }
  }

  return Array.from(seriesMap.values());
};

export class SqliteSeriesRepository implements SeriesRepository {
  constructor(private readonly database: SqliteDatabaseLike) {}

  async initialize(): Promise<void> {
    for (const schemaSql of SQLITE_SCHEMA_SQL) {
      await this.database.execAsync(schemaSql);
    }

    const appliedRows = await this.database.getAllAsync<SqliteMigrationRow>(
      'SELECT id, name, applied_at FROM __migrations ORDER BY id ASC;',
    );
    const appliedIds = new Set(appliedRows.map((row) => row.id));

    for (const migration of MIGRATIONS) {
      if (appliedIds.has(migration.id)) {
        continue;
      }

      for (const sql of migration.up) {
        // Guard against "duplicate column" errors on fresh databases
        // where the column was already added by the initial CREATE TABLE
        try {
          await this.database.execAsync(sql);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes('duplicate column name')) {
            throw err;
          }
        }
      }

      await this.database.runAsync(
        'INSERT INTO __migrations (id, name, applied_at) VALUES (?, ?, ?);',
        migration.id,
        migration.name,
        new Date().toISOString(),
      );
    }
  }

  async listSeriesDetails(): Promise<SeriesDetail[]> {
    const rows = await this.database.getAllAsync<SeriesJoinRow>(LIST_QUERY);
    return mapRowsToSeriesDetails(rows);
  }

  async searchReadSummaries(query: string): Promise<SearchResultItem[]> {
    const keyword = normalize(query);
    if (!keyword) {
      return [];
    }

    const likeKeyword = `%${keyword}%`;
    const rows = await this.database.getAllAsync<SearchRow>(
      SEARCH_READ_SUMMARIES_SQL,
      likeKeyword,
      likeKeyword,
      likeKeyword,
      likeKeyword,
      likeKeyword,
    );

    return rows
      .map((row) => {
        const tags = parsePrivateTags(row.chapter_private_tags_json) ?? [];
        const matchedFields: SearchMatchField[] = [];

        if (includesKeyword(row.series_title, keyword)) {
          matchedFields.push('seriesTitle');
        }
        if (includesKeyword(row.chapter_number, keyword)) {
          matchedFields.push('chapterNumber');
        }
        if (includesKeyword(row.chapter_title, keyword)) {
          matchedFields.push('chapterTitle');
        }
        if (includesKeyword(row.chapter_summary, keyword)) {
          matchedFields.push('summary');
        }
        if (tags.some((tag) => includesKeyword(tag, keyword))) {
          matchedFields.push('tag');
        }

        if (matchedFields.length === 0) {
          return null;
        }

        return {
          seriesId: row.series_id,
          seriesTitle: row.series_title,
          chapterId: row.chapter_id,
          chapterNumber: row.chapter_number,
          chapterTitle: row.chapter_title,
          summary: row.chapter_summary,
          matchedFields,
        } satisfies SearchResultItem;
      })
      .filter((item): item is SearchResultItem => item !== null);
  }

  async createSeries(input: { title: string; lastReadChapterNumber?: string }): Promise<SeriesDetail> {
    const normalizedTitle = input.title.trim() || 'Untitled Series';
    let candidateId = generateUuidV4();
    while ((await this.database.getAllAsync<SqliteIdRow>(FIND_SERIES_ID_SQL, candidateId)).length > 0) {
      candidateId = generateUuidV4();
    }

    const lastReadChapterNumber = input.lastReadChapterNumber?.trim() || '0';

    await this.database.runAsync(
      INSERT_SERIES_SQL,
      candidateId,
      normalizedTitle,
      lastReadChapterNumber,
    );

    return {
      id: candidateId,
      title: normalizedTitle,
      lastReadChapterNumber,
      chapters: [],
    };
  }

  async updateSeries(seriesId: string, input: { title?: string }): Promise<boolean> {
    const normalizedTitle = input.title === undefined ? null : input.title.trim() || null;
    const result = await this.database.runAsync(UPDATE_SERIES_SQL, normalizedTitle, seriesId);

    if (result.changes > 0) {
      await this.database.runAsync(
        UPSERT_SERIES_ACTIVITY_SQL,
        seriesId,
        new Date().toISOString(),
        'edit',
      );
    }

    return result.changes > 0;
  }

  async setLastReadChapterNumber(seriesId: string, chapterNumber: string): Promise<boolean> {
    const normalizedChapterNumber = chapterNumber.trim();
    if (!normalizedChapterNumber) {
      return false;
    }

    const result = await this.database.runAsync(
      UPDATE_SERIES_LAST_READ_SQL,
      normalizedChapterNumber,
      seriesId,
    );

    if (result.changes > 0) {
      await this.database.runAsync(
        UPSERT_SERIES_ACTIVITY_SQL,
        seriesId,
        new Date().toISOString(),
        'edit',
      );
    }

    return result.changes > 0;
  }

  async deleteSeries(seriesId: string): Promise<boolean> {
    await this.database.runAsync(DELETE_SERIES_ACTIVITY_SQL, seriesId);
    await this.database.runAsync(DELETE_SERIES_OPENED_SQL, seriesId);
    await this.database.runAsync(DELETE_CHAPTERS_BY_SERIES_SQL, seriesId);
    const result = await this.database.runAsync(DELETE_SERIES_SQL, seriesId);
    return result.changes > 0;
  }

  async createChapter(
    seriesId: string,
    input: { number: string; title?: string; oneLineSummary?: string; privateNote?: string; isRead?: boolean },
  ): Promise<string | null> {
    const normalizedNumber = input.number.trim();
    if (!normalizedNumber) {
      return null;
    }

    const seriesRows = await this.database.getAllAsync<SqliteIdRow>(FIND_SERIES_ID_SQL, seriesId);
    if (seriesRows.length === 0) {
      return null;
    }

    const maxOrderRows = await this.database.getAllAsync<SqliteMaxOrderRow>(
      SELECT_MAX_CHAPTER_ORDER_SQL,
      seriesId,
    );
    const currentMaxOrder = maxOrderRows[0]?.max_order ?? 0;
    const nextOrder = currentMaxOrder + 1;
    const chapterId = `${seriesId}-${normalizedNumber.replace(/\s+/g, '-')}-${Date.now()}`;

    await this.database.runAsync(
      INSERT_CHAPTER_SQL,
      chapterId,
      seriesId,
      normalizedNumber,
      input.title?.trim() || `Chapter ${normalizedNumber}`,
      input.oneLineSummary?.trim() || '',
      input.privateNote?.trim() || null,
      input.isRead ? 1 : 0,
      nextOrder,
    );

    if (input.isRead) {
      await this.database.runAsync(UPDATE_SERIES_LAST_READ_SQL, normalizedNumber, seriesId);
    }

    await this.database.runAsync(
      UPSERT_SERIES_ACTIVITY_SQL,
      seriesId,
      new Date().toISOString(),
      'edit',
    );

    return chapterId;
  }

  async listRecentlyUpdatedSeries(): Promise<SeriesUpdateActivity[]> {
    const rows = await this.database.getAllAsync<UpdatedSeriesRow>(LIST_UPDATED_SERIES_IDS_SQL);
    return rows.map((row) => ({
      seriesId: row.series_id,
      updatedAt: row.updated_at,
      source: toSeriesUpdateSource(row.update_source),
    }));
  }

  async markSeriesOpened(seriesId: string, openedAt: string = new Date().toISOString()): Promise<void> {
    await this.database.runAsync(UPSERT_SERIES_OPENED_SQL, seriesId, openedAt);
  }

  async listSeriesLastOpened(): Promise<SeriesLastOpened[]> {
    const rows = await this.database.getAllAsync<SeriesOpenedRow>(LIST_SERIES_OPENED_SQL);
    return rows.map((row) => ({
      seriesId: row.series_id,
      openedAt: row.opened_at,
    }));
  }

  async getSeriesDetail(seriesId: string): Promise<SeriesDetail | null> {
    const rows = await this.database.getAllAsync<SeriesJoinRow>(DETAIL_QUERY, seriesId);

    if (rows.length === 0) {
      return null;
    }

    const [detail] = mapRowsToSeriesDetails(rows);
    return detail ?? null;
  }

  async updateChapterSummary(
    seriesId: string,
    chapterId: string,
    update: { oneLineSummary?: string; privateNote?: string | null },
  ): Promise<boolean> {
    const shouldUpdatePrivateNote = update.privateNote !== undefined ? 1 : 0;
    const normalizedPrivateNote =
      update.privateNote === undefined
        ? null
        : update.privateNote?.trim()
          ? update.privateNote.trim()
          : null;

    const result = await this.database.runAsync(
      UPDATE_CHAPTER_SUMMARY_SQL,
      update.oneLineSummary ?? null,
      shouldUpdatePrivateNote,
      normalizedPrivateNote,
      chapterId,
      seriesId,
    );

    if (result.changes > 0) {
      await this.database.runAsync(
        UPSERT_SERIES_ACTIVITY_SQL,
        seriesId,
        new Date().toISOString(),
        'edit',
      );
    }

    return result.changes > 0;
  }

  async setChapterRead(seriesId: string, chapterId: string, isRead: boolean): Promise<boolean> {
    const result = await this.database.runAsync(
      UPDATE_CHAPTER_READ_SQL,
      isRead ? 1 : 0,
      chapterId,
      seriesId,
    );

    if (result.changes === 0) {
      return false;
    }

    if (isRead) {
      const detail = await this.getSeriesDetail(seriesId);
      if (detail) {
        const chapter = detail.chapters.find((c) => c.id === chapterId);
        if (chapter) {
          const parseNum = (n: string): number => {
            const parsed = Number(n);
            return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
          };
          if (parseNum(chapter.number) > parseNum(detail.lastReadChapterNumber)) {
            await this.setLastReadChapterNumber(seriesId, chapter.number);
          }
        }
      }
    }

    return true;
  }
}
