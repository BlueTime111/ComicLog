import { MyComic, RecentlyViewedComic } from '../../../types/comic';

const toChapterLabel = (comic: MyComic, fallback?: string): string => {
  if (comic.progressChapter >= 0) {
    return `Ch. ${comic.progressChapter}`;
  }

  return fallback ?? 'Ch. ?';
};

const buildRecentlyViewedComic = (
  comic: MyComic,
  previous?: RecentlyViewedComic,
): RecentlyViewedComic => {
  return {
    id: comic.id,
    title: comic.title,
    chapterLabel: toChapterLabel(comic, previous?.chapterLabel),
    coverColor: comic.coverColor,
    coverAccent: comic.coverAccent,
    coverText: comic.coverText,
  };
};

export const touchRecentlyViewedComics = (
  recentComics: RecentlyViewedComic[],
  comic: MyComic,
  maxItems: number = 3,
): RecentlyViewedComic[] => {
  const previous = recentComics.find((item) => item.id === comic.id);
  const nextTop = buildRecentlyViewedComic(comic, previous);
  const deduplicated = recentComics.filter((item) => item.id !== comic.id);

  return [nextTop, ...deduplicated].slice(0, maxItems);
};

export const refreshRecentlyViewedComics = (
  recentComics: RecentlyViewedComic[],
  comics: MyComic[],
): RecentlyViewedComic[] => {
  const comicMap = new Map(comics.map((comic) => [comic.id, comic]));

  return recentComics.flatMap((item) => {
    const comic = comicMap.get(item.id);
    if (!comic) {
      return [];
    }

    return [buildRecentlyViewedComic(comic, item)];
  });
};
