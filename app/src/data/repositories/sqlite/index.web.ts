import { ImportRepository } from '../../../features/import/domain/importRepository';
import { SeriesRepository } from '../../../features/series/domain/seriesRepository';

const unsupportedMessage = 'SQLite repositories are not available on web runtime in this scaffold.';

const throwUnsupported = (): never => {
  throw new Error(unsupportedMessage);
};

export const createSqliteRepositories = async (): Promise<{
  seriesRepository: SeriesRepository;
  importRepository: ImportRepository;
  importLogRepository: { listImportLogs: ImportRepository['listImportLogs'] };
}> => {
  return throwUnsupported();
};

export const createSqliteSeriesRepository = async (): Promise<SeriesRepository> => {
  return throwUnsupported();
};

export const createSqliteImportRepository = async (): Promise<ImportRepository> => {
  return throwUnsupported();
};

export const createSqliteImportLogRepository = async (): Promise<{
  listImportLogs: ImportRepository['listImportLogs'];
}> => {
  return throwUnsupported();
};
