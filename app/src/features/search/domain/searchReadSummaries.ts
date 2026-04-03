import { SeriesDetail } from '../../series/domain/series';

export type SearchResultItem = {
  seriesId: string;
  seriesTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  summary: string;
  matchedFields: SearchMatchField[];
};

export type SearchMatchField =
  | 'seriesTitle'
  | 'chapterNumber'
  | 'chapterTitle'
  | 'summary'
  | 'tag';

const normalize = (value: string): string => value.trim().toLowerCase();

const includesKeyword = (value: string, keyword: string): boolean => {
  return normalize(value).includes(keyword);
};

export const searchReadSummaries = (
  seriesList: SeriesDetail[],
  query: string,
): SearchResultItem[] => {
  const keyword = normalize(query);

  if (!keyword) {
    return [];
  }

  return seriesList.flatMap((series) => {
    return series.chapters
      .map((chapter) => {
        const matchedFields: SearchMatchField[] = [];

        if (includesKeyword(series.title, keyword)) {
          matchedFields.push('seriesTitle');
        }
        if (includesKeyword(chapter.number, keyword)) {
          matchedFields.push('chapterNumber');
        }
        if (includesKeyword(chapter.title, keyword)) {
          matchedFields.push('chapterTitle');
        }
        if (includesKeyword(chapter.oneLineSummary, keyword)) {
          matchedFields.push('summary');
        }
        if ((chapter.privateTags ?? []).some((item) => includesKeyword(item, keyword))) {
          matchedFields.push('tag');
        }

        if (matchedFields.length === 0) {
          return null;
        }

        return {
          seriesId: series.id,
          seriesTitle: series.title,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          summary: chapter.oneLineSummary,
          matchedFields,
        };
      })
      .filter((item): item is SearchResultItem => item !== null);
  });
};
