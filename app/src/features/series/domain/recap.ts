export type SeriesChapter = {
  id: string;
  number: string;
  title: string;
  oneLineSummary: string;
  privateNote?: string;
  privateTags?: string[];
  isRead: boolean;
};

export type ReadRecap = {
  previousChapter: SeriesChapter | null;
  recentThree: SeriesChapter[];
  emptyHint: string | null;
};

const defaultEmptyHint = '暂无可回顾内容，请先补充最近一话的一句话总结。';

const parseChapterNumber = (number: string): number => {
  const parsed = Number(number);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
};

export const getReadableChapters = (
  chapters: SeriesChapter[],
  lastReadChapterNumber: string,
): SeriesChapter[] => {
  const explicitIndex = chapters.findIndex((chapter) => chapter.number === lastReadChapterNumber);

  if (explicitIndex >= 0) {
    return chapters.slice(0, explicitIndex + 1);
  }

  const maxReadableNumber = parseChapterNumber(lastReadChapterNumber);

  return chapters.filter((chapter) => parseChapterNumber(chapter.number) <= maxReadableNumber);
};

export const getChaptersByScope = (
  chapters: SeriesChapter[],
  lastReadChapterNumber: string,
  includeOnlyReadChapters: boolean,
): SeriesChapter[] => {
  if (includeOnlyReadChapters) {
    return getReadableChapters(chapters, lastReadChapterNumber);
  }

  return chapters.filter((chapter) => !chapter.isRead);
};

export const buildReadRecap = (chapters: SeriesChapter[], lastReadChapterNumber: string): ReadRecap => {
  const readableChapters = getReadableChapters(chapters, lastReadChapterNumber);

  if (readableChapters.length === 0) {
    return {
      previousChapter: null,
      recentThree: [],
      emptyHint: defaultEmptyHint,
    };
  }

  const previousChapter = readableChapters[readableChapters.length - 1];

  // recentThree: up to 3 chapters BEFORE previousChapter (the chapters leading up to it)
  // This avoids duplicating previousChapter in the "recent three" list
  const recentThree = readableChapters.slice(-4, -1).reverse();

  return {
    previousChapter,
    recentThree,
    emptyHint: null,
  };
};
