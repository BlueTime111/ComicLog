import { ImportRepository } from '../../../features/import/domain/importRepository';
import { SeriesRepository } from '../../../features/series/domain/seriesRepository';
import { SqliteImportRepository } from './SqliteImportRepository';
import { SqliteImportLogRepository } from './SqliteImportLogRepository';
import { SqliteSeriesRepository } from './SqliteSeriesRepository';
import { getSqliteDatabase } from './sqliteClient';
import { seedSqliteFromMockData, shouldSeedSqliteFromMock } from './seedFromMock';

type SqliteRepositories = {
  seriesRepository: SqliteSeriesRepository;
  importRepository: SqliteImportRepository;
  importLogRepository: SqliteImportLogRepository;
};

let sqliteRepositoriesPromise: Promise<SqliteRepositories> | null = null;

const bootstrapSqliteRepositories = async (): Promise<SqliteRepositories> => {
  const database = await getSqliteDatabase();

  const seriesRepository = new SqliteSeriesRepository(database);
  await seriesRepository.initialize();
  if (shouldSeedSqliteFromMock(process.env.EXPO_PUBLIC_SQLITE_SEED)) {
    await seedSqliteFromMockData(database);
  }

  return {
    seriesRepository,
    importRepository: new SqliteImportRepository(database),
    importLogRepository: new SqliteImportLogRepository(database),
  };
};

export const createSqliteRepositories = async (): Promise<SqliteRepositories> => {
  if (!sqliteRepositoriesPromise) {
    sqliteRepositoriesPromise = bootstrapSqliteRepositories();
  }

  return sqliteRepositoriesPromise;
};

export const createSqliteSeriesRepository = async (): Promise<SeriesRepository> => {
  const repositories = await createSqliteRepositories();
  return repositories.seriesRepository;
};

export const createSqliteImportLogRepository = async () => {
  const repositories = await createSqliteRepositories();
  return repositories.importLogRepository;
};

export const createSqliteImportRepository = async (): Promise<ImportRepository> => {
  const repositories = await createSqliteRepositories();
  return repositories.importRepository;
};
