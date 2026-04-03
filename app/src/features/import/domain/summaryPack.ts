import { SeriesChapter } from '../../series/domain/recap';

export type SummaryPackChapter = {
  number: string;
  title?: string;
  summary: string;
  tags?: string[];
  characters?: string[];
};

export type SummaryPack = {
  schemaVersion: string;
  series: {
    id: string;
    title: string;
  };
  pack: {
    packId: string;
    title: string;
    author: string;
    version: number;
    updatedAt: string;
    coverage: {
      start: string;
      end: string;
    };
  };
  chapters: SummaryPackChapter[];
};

export type ImportDiff = {
  addedCount: number;
  updatedCount: number;
  conflictCount: number;
  unchangedCount: number;
};

export type ImportConflictChapter = {
  number: string;
  existingSummary: string;
  incomingSummary: string;
};

export type ImportStrategy = 'missingOnly' | 'overwriteShared' | 'manual';

export type ImportManualDecision = {
  number: string;
  resolution: 'keepLocal' | 'useIncoming';
};

export type ImportPreview = {
  seriesId: string;
  seriesTitle: string;
  packTitle: string;
  author: string;
  version: number;
  coverageLabel: string;
  chapterCount: number;
  addedCount: number;
  updatedCount: number;
  conflictCount: number;
  conflictChapters: ImportConflictChapter[];
};

export type ImportApplyResult = {
  addedCount: number;
  updatedCount: number;
  conflictCount: number;
  preservedPrivateCount: number;
};

export type ImportLogRecord = {
  id: string;
  packId: string;
  seriesId: string;
  packTitle: string;
  importedAt: string;
  strategy: ImportStrategy;
  addedCount: number;
  updatedCount: number;
  conflictCount: number;
};

type ParseResult = {
  data: SummaryPack | null;
  error: string | null;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const parseSummaryPack = (raw: string): ParseResult => {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return {
      data: null,
      error: '总结包格式无效：不是合法 JSON。',
    };
  }

  if (!isObject(parsedJson)) {
    return {
      data: null,
      error: '总结包格式无效：根节点必须是对象。',
    };
  }

  if (typeof parsedJson.schemaVersion !== 'string' || !parsedJson.schemaVersion.trim()) {
    return {
      data: null,
      error: '总结包格式无效：缺少 schemaVersion。',
    };
  }

  if (!isObject(parsedJson.series) || typeof parsedJson.series.id !== 'string' || typeof parsedJson.series.title !== 'string') {
    return {
      data: null,
      error: '总结包格式无效：series 字段不完整。',
    };
  }

  if (!isObject(parsedJson.pack)) {
    return {
      data: null,
      error: '总结包格式无效：pack 字段不完整。',
    };
  }

  if (
    typeof parsedJson.pack.packId !== 'string' ||
    typeof parsedJson.pack.title !== 'string' ||
    typeof parsedJson.pack.author !== 'string' ||
    typeof parsedJson.pack.version !== 'number' ||
    typeof parsedJson.pack.updatedAt !== 'string' ||
    !isObject(parsedJson.pack.coverage) ||
    typeof parsedJson.pack.coverage.start !== 'string' ||
    typeof parsedJson.pack.coverage.end !== 'string'
  ) {
    return {
      data: null,
      error: '总结包格式无效：pack 字段不完整。',
    };
  }

  if (!Array.isArray(parsedJson.chapters)) {
    return {
      data: null,
      error: '总结包格式无效：chapters 必须是数组。',
    };
  }

  for (const chapter of parsedJson.chapters) {
    if (!isObject(chapter) || typeof chapter.number !== 'string' || typeof chapter.summary !== 'string') {
      return {
        data: null,
        error: '总结包格式无效：chapter 必须包含 number 和 summary。',
      };
    }
  }

  return {
    data: parsedJson as SummaryPack,
    error: null,
  };
};

export const buildImportDiff = (
  incomingChapters: Pick<SummaryPackChapter, 'number' | 'summary'>[],
  existingChapters: Pick<SeriesChapter, 'number' | 'oneLineSummary'>[],
): ImportDiff => {
  const existingMap = new Map(existingChapters.map((chapter) => [chapter.number, chapter.oneLineSummary]));

  let addedCount = 0;
  let updatedCount = 0;
  let conflictCount = 0;
  let unchangedCount = 0;

  for (const chapter of incomingChapters) {
    const currentSummary = existingMap.get(chapter.number);

    if (currentSummary === undefined) {
      addedCount += 1;
      continue;
    }

    if (currentSummary.trim() === chapter.summary.trim()) {
      unchangedCount += 1;
      continue;
    }

    updatedCount += 1;
    conflictCount += 1;
  }

  return {
    addedCount,
    updatedCount,
    conflictCount,
    unchangedCount,
  };
};

export const buildImportConflictDetails = (
  incomingChapters: Pick<SummaryPackChapter, 'number' | 'summary'>[],
  existingChapters: Pick<SeriesChapter, 'number' | 'oneLineSummary'>[],
): ImportConflictChapter[] => {
  const existingMap = new Map(existingChapters.map((chapter) => [chapter.number, chapter.oneLineSummary]));

  return incomingChapters
    .map((incoming) => {
      const existing = existingMap.get(incoming.number);

      if (existing === undefined || existing.trim() === incoming.summary.trim()) {
        return null;
      }

      return {
        number: incoming.number,
        existingSummary: existing,
        incomingSummary: incoming.summary,
      };
    })
    .filter((item): item is ImportConflictChapter => item !== null);
};
