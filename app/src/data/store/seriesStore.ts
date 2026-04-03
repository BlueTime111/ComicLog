import { seriesDetails } from '../mock/seriesData';
import { SeriesDetail } from '../../features/series/domain/series';

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let store: SeriesDetail[] = deepClone(seriesDetails);

export const getSeriesStore = (): SeriesDetail[] => store;

export const resetSeriesStore = () => {
  store = deepClone(seriesDetails);
};

export const cloneSeriesDetail = (detail: SeriesDetail): SeriesDetail => deepClone(detail);
