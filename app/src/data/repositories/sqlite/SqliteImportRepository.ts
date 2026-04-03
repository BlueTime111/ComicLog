import { ImportRepository } from '../../../features/import/domain/importRepository';
import {
  buildImportConflictDetails,
  buildImportDiff,
  ImportApplyResult,
  ImportLogRecord,
  ImportManualDecision,
  ImportPreview,
  ImportStrategy,
  SummaryPack,
} from '../../../features/import/domain/summaryPack';
import { SqliteDatabaseLike } from './types';

type ExistingChapterRow = {
  number: string;
  one_line_summary: string;
};

type ExistingChapterDetailRow = {
  id: string;
  title: string;
  one_line_summary: string;
  private_note: string | null;
  chapter_order: number;
};

type ExistingSeriesRow = {
  id: string;
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

const SELECT_CHAPTER_SUMMARIES_BY_SERIES_SQL = `
SELECT number, one_line_summary
FROM chapters
WHERE series_id = ?;
`;

const SELECT_SERIES_BY_ID_SQL = `
SELECT id
FROM series
WHERE id = ?;
`;

const INSERT_SERIES_SQL = `
INSERT INTO series (id, title, last_read_chapter_number)
VALUES (?, ?, ?);
`;

const SELECT_CHAPTER_BY_NUMBER_SQL = `
SELECT id, title, one_line_summary, private_note, chapter_order
FROM chapters
WHERE series_id = ? AND number = ?;
`;

const INSERT_CHAPTER_SQL = `
INSERT INTO chapters (
  id,
  series_id,
  number,
  title,
  one_line_summary,
  is_read,
  chapter_order
)
VALUES (?, ?, ?, ?, ?, ?, ?);
`;

const DELETE_CHAPTERS_BY_SERIES_SQL = `
DELETE FROM chapters
WHERE series_id = ?;
`;

const UPDATE_CHAPTER_SUMMARY_SQL = `
UPDATE chapters
SET one_line_summary = ?, title = ?
WHERE id = ?;
`;

const INSERT_IMPORT_LOG_SQL = `
INSERT INTO import_logs (
  id,
  pack_id,
  series_id,
  pack_title,
  imported_at,
  strategy,
  added_count,
  updated_count,
  conflict_count
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

const UPSERT_SERIES_ACTIVITY_SQL = `
INSERT INTO series_activity (series_id, updated_at, update_source)
VALUES (?, ?, ?)
ON CONFLICT(series_id)
DO UPDATE SET
  updated_at = excluded.updated_at,
  update_source = excluded.update_source;
`;

const LIST_IMPORT_LOGS_SQL = `
SELECT
  id,
  pack_id,
  series_id,
  pack_title,
  imported_at,
  strategy,
  added_count,
  updated_count,
  conflict_count
FROM import_logs
ORDER BY imported_at DESC;
`;

const BEGIN_TRANSACTION_SQL = 'BEGIN TRANSACTION;';
const COMMIT_TRANSACTION_SQL = 'COMMIT;';
const ROLLBACK_TRANSACTION_SQL = 'ROLLBACK;';

const toImportStrategy = (value: string): ImportStrategy => {
  if (value === 'missingOnly' || value === 'overwriteShared' || value === 'manual') {
    return value;
  }

  return 'missingOnly';
};

const createChapterId = (seriesId: string, chapterNumber: string): string => {
  const normalized = chapterNumber.replace(/\s+/g, '-');
  return `${seriesId}-${normalized}`;
};

const shouldUseIncomingForConflict = (
  strategy: ImportStrategy,
  chapterNumber: string,
  manualMap: Map<string, ImportManualDecision>,
): boolean => {
  if (strategy === 'overwriteShared') {
    return true;
  }

  if (strategy !== 'manual') {
    return false;
  }

  return manualMap.get(chapterNumber)?.resolution === 'useIncoming';
};

export class SqliteImportRepository implements ImportRepository {
  constructor(private readonly database: SqliteDatabaseLike) {}

  private async resolveTargetSeriesId(pack: SummaryPack): Promise<string | null> {
    const byId = await this.database.getAllAsync<ExistingSeriesRow>(
      SELECT_SERIES_BY_ID_SQL,
      pack.series.id,
    );
    return byId[0]?.id ?? null;
  }

  async previewPack(pack: SummaryPack): Promise<ImportPreview> {
    const resolvedSeriesId = await this.resolveTargetSeriesId(pack);
    const targetSeriesId = resolvedSeriesId ?? pack.series.id;
    const existingRows = resolvedSeriesId
      ? await this.database.getAllAsync<ExistingChapterRow>(
          SELECT_CHAPTER_SUMMARIES_BY_SERIES_SQL,
          targetSeriesId,
        )
      : [];

    const existingChapters = existingRows.map((row) => ({
      number: row.number,
      oneLineSummary: row.one_line_summary,
    }));

    const incomingChapters = pack.chapters.map((chapter) => ({
      number: chapter.number,
      summary: chapter.summary,
    }));

    const diff = buildImportDiff(incomingChapters, existingChapters);
    const conflictChapters = buildImportConflictDetails(incomingChapters, existingChapters);

    return {
      seriesId: targetSeriesId,
      seriesTitle: pack.series.title,
      packTitle: pack.pack.title,
      author: pack.pack.author,
      version: pack.pack.version,
      coverageLabel: `${pack.pack.coverage.start} - ${pack.pack.coverage.end}`,
      chapterCount: pack.chapters.length,
      addedCount: diff.addedCount,
      updatedCount: diff.updatedCount,
      conflictCount: diff.conflictCount,
      conflictChapters,
    };
  }

  async applyPack(
    pack: SummaryPack,
    strategy: ImportStrategy,
    manualDecisions: ImportManualDecision[] = [],
  ): Promise<ImportApplyResult> {
    await this.database.execAsync(BEGIN_TRANSACTION_SQL);

    try {
      const manualMap = new Map(manualDecisions.map((decision) => [decision.number, decision]));
      const resolvedSeriesId = await this.resolveTargetSeriesId(pack);
      const targetSeriesId = resolvedSeriesId ?? pack.series.id;
      const isCreatingSeries = !resolvedSeriesId;

      if (isCreatingSeries) {
        await this.database.runAsync(
          INSERT_SERIES_SQL,
          targetSeriesId,
          pack.series.title,
          pack.pack.coverage.end,
        );
        await this.database.runAsync(DELETE_CHAPTERS_BY_SERIES_SQL, targetSeriesId);
      }

      let addedCount = 0;
      let updatedCount = 0;
      let conflictCount = 0;
      let preservedPrivateCount = 0;

      for (let index = 0; index < pack.chapters.length; index += 1) {
        const incoming = pack.chapters[index];
        if (!incoming) {
          continue;
        }

        const existing = isCreatingSeries
          ? undefined
          : (
              await this.database.getAllAsync<ExistingChapterDetailRow>(
                SELECT_CHAPTER_BY_NUMBER_SQL,
                targetSeriesId,
                incoming.number,
              )
            )[0];

        if (!existing) {
          await this.database.runAsync(
            INSERT_CHAPTER_SQL,
            createChapterId(targetSeriesId, incoming.number),
            targetSeriesId,
            incoming.number,
            incoming.title ?? `Chapter ${incoming.number}`,
            incoming.summary,
            0,
            index + 1,
          );
          addedCount += 1;
          continue;
        }

        if (existing.one_line_summary.trim() === incoming.summary.trim()) {
          continue;
        }

        conflictCount += 1;

        if (!shouldUseIncomingForConflict(strategy, incoming.number, manualMap)) {
          continue;
        }

        if (existing.private_note?.trim()) {
          preservedPrivateCount += 1;
        }

        await this.database.runAsync(
          UPDATE_CHAPTER_SUMMARY_SQL,
          incoming.summary,
          incoming.title ?? existing.title,
          existing.id,
        );
        updatedCount += 1;
      }

      const now = new Date().toISOString();
      await this.database.runAsync(
        INSERT_IMPORT_LOG_SQL,
        `${pack.pack.packId}-${Date.now()}`,
        pack.pack.packId,
        targetSeriesId,
        pack.pack.title,
        now,
        strategy,
        addedCount,
        updatedCount,
        conflictCount,
      );

      if (addedCount > 0 || updatedCount > 0) {
        await this.database.runAsync(UPSERT_SERIES_ACTIVITY_SQL, targetSeriesId, now, 'import');
      }

      await this.database.execAsync(COMMIT_TRANSACTION_SQL);

      return {
        addedCount,
        updatedCount,
        conflictCount,
        preservedPrivateCount,
      };
    } catch (error) {
      await this.database.execAsync(ROLLBACK_TRANSACTION_SQL);
      throw error;
    }
  }

  async listImportLogs(): Promise<ImportLogRecord[]> {
    const rows = await this.database.getAllAsync<ImportLogRow>(LIST_IMPORT_LOGS_SQL);

    return rows.map((row) => ({
      id: row.id,
      packId: row.pack_id,
      seriesId: row.series_id,
      packTitle: row.pack_title,
      importedAt: row.imported_at,
      strategy: toImportStrategy(row.strategy),
      addedCount: row.added_count,
      updatedCount: row.updated_count,
      conflictCount: row.conflict_count,
    }));
  }
}
