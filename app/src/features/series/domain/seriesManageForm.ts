import { CreateSeriesInput } from './seriesRepository';

export const normalizeSeriesTitle = (title: string): string => title.trim();

export const normalizeLastReadChapterNumber = (chapterNumber: string): string => {
  return chapterNumber.trim() || '0';
};

export const buildCreateSeriesInput = (title: string): CreateSeriesInput => {
  return {
    title: normalizeSeriesTitle(title),
    lastReadChapterNumber: '0',
  };
};
