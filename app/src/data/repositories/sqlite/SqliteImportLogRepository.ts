import { ImportLogRecord, ImportStrategy } from '../../../features/import/domain/summaryPack';
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

const LIST_IMPORT_LOGS_QUERY = `
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

const toImportStrategy = (strategy: string): ImportStrategy => {
  if (strategy === 'overwriteShared' || strategy === 'manual' || strategy === 'missingOnly') {
    return strategy;
  }

  return 'missingOnly';
};

export class SqliteImportLogRepository {
  constructor(private readonly database: SqliteDatabaseLike) {}

  async listImportLogs(): Promise<ImportLogRecord[]> {
    const rows = await this.database.getAllAsync<ImportLogRow>(LIST_IMPORT_LOGS_QUERY);

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
