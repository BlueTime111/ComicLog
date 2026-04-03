import { SeriesRepository } from '../../features/series/domain/seriesRepository';
import { SeriesDetail } from '../../features/series/domain/series';
import { searchReadSummaries } from '../../features/search/domain/searchReadSummaries';
import { cloneSeriesDetail, getSeriesStore } from '../store/seriesStore';
import { listUpdatedSeriesActivity, markSeriesUpdated } from '../store/seriesActivityStore';
import {
  clearSeriesLastOpened,
  listSeriesLastOpened as listSeriesLastOpenedFromStore,
  markSeriesOpened as markSeriesOpenedInStore,
} from '../store/seriesOpenedStore';
import { generateUuidV4 } from '../../utils/uuid';

const buildUniqueSeriesId = (existingIds: Set<string>): string => {
  let candidateId = generateUuidV4();
  while (existingIds.has(candidateId)) {
    candidateId = generateUuidV4();
  }
  return candidateId;
};

export class MockSeriesRepository implements SeriesRepository {
  async getSeriesDetail(seriesId: string): Promise<SeriesDetail | null> {
    const detail = getSeriesStore().find((series) => series.id === seriesId);
    return detail ? cloneSeriesDetail(detail) : null;
  }

  async listSeriesDetails(): Promise<SeriesDetail[]> {
    return getSeriesStore().map((detail) => cloneSeriesDetail(detail));
  }

  async createSeries(input: { title: string; lastReadChapterNumber?: string }): Promise<SeriesDetail> {
    const store = getSeriesStore();
    const id = buildUniqueSeriesId(new Set(store.map((series) => series.id)));

    const created: SeriesDetail = {
      id,
      title: input.title.trim() || 'Untitled Series',
      lastReadChapterNumber: input.lastReadChapterNumber?.trim() || '0',
      chapters: [],
    };

    store.unshift(created);
    return cloneSeriesDetail(created);
  }

  async updateSeries(
    seriesId: string,
    input: { title?: string },
  ): Promise<boolean> {
    const series = getSeriesStore().find((item) => item.id === seriesId);
    if (!series) {
      return false;
    }

    if (input.title !== undefined) {
      series.title = input.title.trim() || series.title;
    }

    markSeriesUpdated(seriesId, 'edit');
    return true;
  }

  async setLastReadChapterNumber(seriesId: string, chapterNumber: string): Promise<boolean> {
    const series = getSeriesStore().find((item) => item.id === seriesId);
    if (!series) {
      return false;
    }

    series.lastReadChapterNumber = chapterNumber.trim() || series.lastReadChapterNumber;
    markSeriesUpdated(seriesId, 'edit');
    return true;
  }

  async deleteSeries(seriesId: string): Promise<boolean> {
    const store = getSeriesStore();
    const index = store.findIndex((item) => item.id === seriesId);
    if (index < 0) {
      return false;
    }

    store.splice(index, 1);
    clearSeriesLastOpened(seriesId);
    return true;
  }

  async createChapter(
    seriesId: string,
    input: { number: string; title?: string; oneLineSummary?: string; privateNote?: string; isRead?: boolean },
  ): Promise<string | null> {
    const series = getSeriesStore().find((item) => item.id === seriesId);
    const normalizedNumber = input.number.trim();

    if (!series || !normalizedNumber) {
      return null;
    }

    const baseId = `${seriesId}-${normalizedNumber.replace(/\s+/g, '-')}`;
    let chapterId = baseId;
    let suffix = 2;
    const existingIds = new Set(series.chapters.map((chapter) => chapter.id));
    while (existingIds.has(chapterId)) {
      chapterId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    series.chapters.push({
      id: chapterId,
      number: normalizedNumber,
      title: input.title?.trim() || `Chapter ${normalizedNumber}`,
      oneLineSummary: input.oneLineSummary?.trim() || '',
      privateNote: input.privateNote?.trim() || undefined,
      isRead: input.isRead ?? false,
    });

    if (input.isRead) {
      series.lastReadChapterNumber = normalizedNumber;
    }

    markSeriesUpdated(seriesId, 'edit');
    return chapterId;
  }

  async listRecentlyUpdatedSeries() {
    return listUpdatedSeriesActivity();
  }

  async markSeriesOpened(seriesId: string, openedAt?: string): Promise<void> {
    const exists = getSeriesStore().some((item) => item.id === seriesId);
    if (!exists) {
      return;
    }

    markSeriesOpenedInStore(seriesId, openedAt);
  }

  async listSeriesLastOpened() {
    return listSeriesLastOpenedFromStore();
  }

  async setChapterRead(seriesId: string, chapterId: string, isRead: boolean): Promise<boolean> {
    const series = getSeriesStore().find((item) => item.id === seriesId);
    const chapter = series?.chapters.find((item) => item.id === chapterId);

    if (!series || !chapter) {
      return false;
    }

    chapter.isRead = isRead;

    if (isRead) {
      const chapterNum = chapter.number;
      const lastReadNum = series.lastReadChapterNumber;
      const parseNum = (n: string): number => {
        const parsed = Number(n);
        return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
      };
      if (parseNum(chapterNum) > parseNum(lastReadNum)) {
        series.lastReadChapterNumber = chapterNum;
      }
    }

    markSeriesUpdated(seriesId, 'edit');
    return true;
  }

  async searchReadSummaries(query: string) {
    return searchReadSummaries(getSeriesStore().map((detail) => cloneSeriesDetail(detail)), query);
  }

  async updateChapterSummary(
    seriesId: string,
    chapterId: string,
    update: { oneLineSummary?: string; privateNote?: string | null },
  ): Promise<boolean> {
    const series = getSeriesStore().find((item) => item.id === seriesId);
    const chapter = series?.chapters.find((item) => item.id === chapterId);

    if (!chapter) {
      return false;
    }

    if (update.oneLineSummary !== undefined) {
      chapter.oneLineSummary = update.oneLineSummary;
    }

    if (update.privateNote !== undefined) {
      const nextNote = update.privateNote?.trim();
      chapter.privateNote = nextNote ? nextNote : undefined;
    }

    markSeriesUpdated(seriesId, 'edit');

    return true;
  }
}
