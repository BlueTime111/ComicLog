import { MyComic, SyncStatus } from '../../../types/comic';
import { SeriesDetail } from '../../series/domain/series';

export type HomeComicMeta = {
  coverColor: string;
  coverAccent: string;
  coverText: string;
  collection: 'tracking' | 'library';
  updatedAt?: string;
  updatedAgoLabel: string;
  status: SyncStatus;
  statusLabel?: string;
};

const defaultSummary = '';
const legacyEmptySharedSummary = '暂无对应已读章节总结。';

const normalizeSummary = (value?: string): string => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed === legacyEmptySharedSummary) {
    return '';
  }

  return trimmed;
};

const parseProgressChapter = (numberValue: string): number => {
  const parsed = Number(numberValue);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildProgressRatio = (series: SeriesDetail): number => {
  const readValue = parseProgressChapter(series.lastReadChapterNumber);
  const chapterNumbers = series.chapters
    .map((chapter) => parseProgressChapter(chapter.number))
    .filter((number) => number > 0);

  const maxChapterNumber = chapterNumbers.length > 0 ? Math.max(...chapterNumbers) : readValue;

  if (maxChapterNumber <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(readValue / maxChapterNumber, 1));
};

export const mapSeriesToHomeComic = (series: SeriesDetail, meta: HomeComicMeta): MyComic => {
  const currentChapter = series.chapters.find((chapter) => chapter.number === series.lastReadChapterNumber);
  const resolvedSummary = normalizeSummary(currentChapter?.oneLineSummary)
    || normalizeSummary(currentChapter?.privateNote)
    || defaultSummary;

  return {
    id: series.id,
    title: series.title,
    oneLineSummary: resolvedSummary,
    progressChapter: parseProgressChapter(series.lastReadChapterNumber),
    progressRatio: buildProgressRatio(series),
    status: meta.status,
    statusLabel: meta.statusLabel ?? meta.status,
    updatedAt: meta.updatedAt,
    updatedAgoLabel: meta.updatedAgoLabel,
    coverColor: meta.coverColor,
    coverAccent: meta.coverAccent,
    coverText: meta.coverText,
    collection: meta.collection,
  };
};
