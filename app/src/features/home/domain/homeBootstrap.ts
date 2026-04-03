import { MyComic, RecentlyViewedComic } from '../../../types/comic';

type HomeBootstrapState = {
  computedComics: MyComic[];
  recentComics: RecentlyViewedComic[];
};

export const createHomeBootstrapState = (
  dataSource: 'mock' | 'sqlite',
  seededComics: MyComic[],
  seededRecentComics: RecentlyViewedComic[],
): HomeBootstrapState => {
  if (dataSource === 'mock') {
    return {
      computedComics: seededComics,
      recentComics: seededRecentComics,
    };
  }

  return {
    computedComics: [],
    recentComics: [],
  };
};
