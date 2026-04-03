import { seriesDetails } from '../../mock/seriesData';
import { SqliteDatabaseLike } from './types';

const MOCK_SEED_VERSION = 'mock_seed_v1';
const MOCK_SEED_KEY = 'mock_seed_version';

const SELECT_SERIES_COUNT_SQL = `
SELECT COUNT(*) AS count FROM series;
`;

const SELECT_MOCK_SEED_MARKER_SQL = `
SELECT value FROM app_meta WHERE key = ?;
`;

const UPSERT_MOCK_SEED_MARKER_SQL = `
INSERT OR REPLACE INTO app_meta (key, value)
VALUES (?, ?);
`;

const INSERT_SERIES_SQL = `
INSERT OR REPLACE INTO series (id, title, last_read_chapter_number)
VALUES (?, ?, ?);
`;

const INSERT_CHAPTER_SQL = `
INSERT OR REPLACE INTO chapters (
  id,
  series_id,
  number,
  title,
  one_line_summary,
  private_note,
  private_tags_json,
  is_read,
  chapter_order
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

const DISABLE_SEED_VALUES = new Set(['off', 'false', '0', 'no']);

type SeedResult = {
  seeded: boolean;
  seriesCount: number;
  chapterCount: number;
};

export const shouldSeedSqliteFromMock = (configuredValue?: string): boolean => {
  const normalized = configuredValue?.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return !DISABLE_SEED_VALUES.has(normalized);
};

export const seedSqliteFromMockData = async (database: SqliteDatabaseLike): Promise<SeedResult> => {
  const markerRows = await database.getAllAsync<{ value: string }>(
    SELECT_MOCK_SEED_MARKER_SQL,
    MOCK_SEED_KEY,
  );
  const existingMarkerValue = markerRows[0]?.value;

  if (existingMarkerValue === MOCK_SEED_VERSION) {
    return {
      seeded: false,
      seriesCount: 0,
      chapterCount: 0,
    };
  }

  const countRows = await database.getAllAsync<{ count: number }>(SELECT_SERIES_COUNT_SQL);
  const existingCount = countRows[0]?.count ?? 0;

  if (existingCount > 0) {
    await database.runAsync(UPSERT_MOCK_SEED_MARKER_SQL, MOCK_SEED_KEY, MOCK_SEED_VERSION);

    return {
      seeded: false,
      seriesCount: 0,
      chapterCount: 0,
    };
  }

  let seriesCount = 0;
  let chapterCount = 0;

  for (const series of seriesDetails) {
    await database.runAsync(INSERT_SERIES_SQL, series.id, series.title, series.lastReadChapterNumber);
    seriesCount += 1;

    for (let index = 0; index < series.chapters.length; index += 1) {
      const chapter = series.chapters[index];

      if (!chapter) {
        continue;
      }

      await database.runAsync(
        INSERT_CHAPTER_SQL,
        chapter.id,
        series.id,
        chapter.number,
        chapter.title,
        chapter.oneLineSummary,
        chapter.privateNote ?? null,
        chapter.privateTags && chapter.privateTags.length > 0
          ? JSON.stringify(chapter.privateTags)
          : null,
        chapter.isRead ? 1 : 0,
        index + 1,
      );
      chapterCount += 1;
    }
  }

  await database.runAsync(UPSERT_MOCK_SEED_MARKER_SQL, MOCK_SEED_KEY, MOCK_SEED_VERSION);

  return {
    seeded: true,
    seriesCount,
    chapterCount,
  };
};
