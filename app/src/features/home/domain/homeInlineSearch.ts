import { MyComic, RecentlyViewedComic } from '../../../types/comic';

const normalizeInlineQuery = (value: string): string => value.trim().toLowerCase();

export const hasInlineSearchQuery = (query: string): boolean => normalizeInlineQuery(query).length > 0;

const includesInlineKeyword = (value: string, keyword: string): boolean => {
  return value.toLowerCase().includes(keyword);
};

export const filterHomeComicsByInlineQuery = (comics: MyComic[], query: string): MyComic[] => {
  const keyword = normalizeInlineQuery(query);
  if (!keyword) {
    return comics;
  }

  return comics.filter((comic) => {
    return includesInlineKeyword(comic.title, keyword) || includesInlineKeyword(comic.oneLineSummary, keyword);
  });
};

export const filterRecentlyViewedComicsByInlineQuery = (
  comics: RecentlyViewedComic[],
  query: string,
): RecentlyViewedComic[] => {
  const keyword = normalizeInlineQuery(query);
  if (!keyword) {
    return comics;
  }

  return comics.filter((comic) => {
    return (
      includesInlineKeyword(comic.title, keyword)
      || includesInlineKeyword(comic.chapterLabel, keyword)
    );
  });
};
