import { recentlyViewedComics } from '../mock/homeData';
import { RecentlyViewedComic } from '../../types/comic';

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let store: RecentlyViewedComic[] = deepClone(recentlyViewedComics);

export const getRecentlyViewedStore = (): RecentlyViewedComic[] => deepClone(store);

export const setRecentlyViewedStore = (next: RecentlyViewedComic[]) => {
  store = deepClone(next);
};

export const resetRecentlyViewedStore = () => {
  store = deepClone(recentlyViewedComics);
};
