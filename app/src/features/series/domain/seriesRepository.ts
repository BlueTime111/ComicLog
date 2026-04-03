import { SeriesDetail } from './series';
import { SearchResultItem } from '../../search/domain/searchReadSummaries';

export type ChapterSummaryUpdate = {
  oneLineSummary?: string;
  privateNote?: string | null;
};

export type CreateSeriesInput = {
  title: string;
  lastReadChapterNumber?: string;
};

export type UpdateSeriesInput = {
  title?: string;
};

export type CreateChapterInput = {
  number: string;
  title?: string;
  oneLineSummary?: string;
  privateNote?: string;
  isRead?: boolean;
};

export type SeriesUpdateActivity = {
  seriesId: string;
  updatedAt: string;
  source: 'edit' | 'import';
};

export type SeriesLastOpened = {
  seriesId: string;
  openedAt: string;
};

export interface SeriesRepository {
  getSeriesDetail(seriesId: string): Promise<SeriesDetail | null>;
  listSeriesDetails(): Promise<SeriesDetail[]>;
  createSeries(input: CreateSeriesInput): Promise<SeriesDetail>;
  updateSeries(seriesId: string, input: UpdateSeriesInput): Promise<boolean>;
  setLastReadChapterNumber(seriesId: string, chapterNumber: string): Promise<boolean>;
  deleteSeries(seriesId: string): Promise<boolean>;
  createChapter(seriesId: string, input: CreateChapterInput): Promise<string | null>;
  setChapterRead(seriesId: string, chapterId: string, isRead: boolean): Promise<boolean>;
  searchReadSummaries(query: string): Promise<SearchResultItem[]>;
  listRecentlyUpdatedSeries(): Promise<SeriesUpdateActivity[]>;
  markSeriesOpened(seriesId: string, openedAt?: string): Promise<void>;
  listSeriesLastOpened(): Promise<SeriesLastOpened[]>;
  updateChapterSummary(
    seriesId: string,
    chapterId: string,
    update: ChapterSummaryUpdate,
  ): Promise<boolean>;
}
