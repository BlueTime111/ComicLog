import { ImportRepository } from '../../features/import/domain/importRepository';
import { SummaryPack, ImportStrategy, ImportManualDecision } from '../../features/import/domain/summaryPack';
import { SeriesRepository } from '../../features/series/domain/seriesRepository';
import { resolveDataSource, shouldFallbackToMockOnRepositoryError } from './dataSource';
import { MockSeriesRepository } from './MockSeriesRepository';
import { MockImportRepository } from './MockImportRepository';
export {
  createSqliteRepositories,
  createSqliteSeriesRepository,
  createSqliteImportLogRepository,
  createSqliteImportRepository,
} from './sqlite';
export { resolveDataSource } from './dataSource';

const mockSeriesRepository = new MockSeriesRepository();
const mockImportRepository = new MockImportRepository();

const selectedDataSource = resolveDataSource(process.env.EXPO_PUBLIC_DATA_SOURCE);
export const repositoryDataSource = selectedDataSource;

const runtimePlatform = process.env.EXPO_OS
  ?? ((typeof globalThis !== 'undefined' && 'document' in globalThis) ? 'web' : 'native');

const canFallbackToMock = shouldFallbackToMockOnRepositoryError(selectedDataSource, runtimePlatform);

let sqliteSeriesRepositoryPromise: Promise<SeriesRepository> | null = null;
let sqliteImportRepositoryPromise: Promise<ImportRepository> | null = null;

const getSqliteSeriesRepository = async (): Promise<SeriesRepository> => {
  const repositoryPromise = sqliteSeriesRepositoryPromise
    ?? import('./sqlite').then((mod) => mod.createSqliteSeriesRepository());

  sqliteSeriesRepositoryPromise = repositoryPromise;
  return repositoryPromise;
};

const getSqliteImportRepository = async (): Promise<ImportRepository> => {
  const repositoryPromise = sqliteImportRepositoryPromise
    ?? import('./sqlite').then((mod) => mod.createSqliteImportRepository());

  sqliteImportRepositoryPromise = repositoryPromise;
  return repositoryPromise;
};

const sqliteSeriesRepositoryProxy: SeriesRepository = {
  async getSeriesDetail(seriesId) {
    try {
      return (await getSqliteSeriesRepository()).getSeriesDetail(seriesId);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.getSeriesDetail(seriesId);
    }
  },
  async listSeriesDetails() {
    try {
      return (await getSqliteSeriesRepository()).listSeriesDetails();
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.listSeriesDetails();
    }
  },
  async createSeries(input) {
    try {
      return (await getSqliteSeriesRepository()).createSeries(input);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.createSeries(input);
    }
  },
  async updateSeries(seriesId, input) {
    try {
      return (await getSqliteSeriesRepository()).updateSeries(seriesId, input);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.updateSeries(seriesId, input);
    }
  },
  async setLastReadChapterNumber(seriesId, chapterNumber) {
    try {
      return (await getSqliteSeriesRepository()).setLastReadChapterNumber(seriesId, chapterNumber);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.setLastReadChapterNumber(seriesId, chapterNumber);
    }
  },
  async deleteSeries(seriesId) {
    try {
      return (await getSqliteSeriesRepository()).deleteSeries(seriesId);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.deleteSeries(seriesId);
    }
  },
  async createChapter(seriesId, input) {
    try {
      return (await getSqliteSeriesRepository()).createChapter(seriesId, input);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.createChapter(seriesId, input);
    }
  },
  async searchReadSummaries(query) {
    try {
      return (await getSqliteSeriesRepository()).searchReadSummaries(query);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.searchReadSummaries(query);
    }
  },
  async listRecentlyUpdatedSeries() {
    try {
      return (await getSqliteSeriesRepository()).listRecentlyUpdatedSeries();
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.listRecentlyUpdatedSeries();
    }
  },
  async markSeriesOpened(seriesId, openedAt) {
    try {
      return (await getSqliteSeriesRepository()).markSeriesOpened(seriesId, openedAt);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.markSeriesOpened(seriesId, openedAt);
    }
  },
  async listSeriesLastOpened() {
    try {
      return (await getSqliteSeriesRepository()).listSeriesLastOpened();
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.listSeriesLastOpened();
    }
  },
  async updateChapterSummary(seriesId, chapterId, update) {
    try {
      return (await getSqliteSeriesRepository()).updateChapterSummary(seriesId, chapterId, update);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.updateChapterSummary(seriesId, chapterId, update);
    }
  },
  async setChapterRead(seriesId, chapterId, isRead) {
    try {
      return (await getSqliteSeriesRepository()).setChapterRead(seriesId, chapterId, isRead);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockSeriesRepository.setChapterRead(seriesId, chapterId, isRead);
    }
  },
};

const sqliteImportRepositoryProxy: ImportRepository = {
  async previewPack(pack: SummaryPack) {
    try {
      return (await getSqliteImportRepository()).previewPack(pack);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockImportRepository.previewPack(pack);
    }
  },
  async applyPack(
    pack: SummaryPack,
    strategy: ImportStrategy,
    manualDecisions?: ImportManualDecision[],
  ) {
    try {
      return (await getSqliteImportRepository()).applyPack(pack, strategy, manualDecisions);
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockImportRepository.applyPack(pack, strategy, manualDecisions);
    }
  },
  async listImportLogs() {
    try {
      return (await getSqliteImportRepository()).listImportLogs();
    } catch (error) {
      if (!canFallbackToMock) {
        throw error;
      }
      return mockImportRepository.listImportLogs();
    }
  },
};

export const seriesRepository: SeriesRepository =
  selectedDataSource === 'sqlite' ? sqliteSeriesRepositoryProxy : mockSeriesRepository;

export const importRepository: ImportRepository =
  selectedDataSource === 'sqlite' ? sqliteImportRepositoryProxy : mockImportRepository;
