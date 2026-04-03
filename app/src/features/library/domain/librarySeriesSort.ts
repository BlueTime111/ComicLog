import { SeriesDetail } from '../../series/domain/series';

export type LibrarySortOrder = 'recent_first' | 'oldest_first';

const toTimestamp = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const sortLibrarySeriesByOpenedAt = (
  seriesList: SeriesDetail[],
  openedAtBySeriesId: Record<string, string | undefined>,
  order: LibrarySortOrder,
): SeriesDetail[] => {
  const direction = order === 'recent_first' ? -1 : 1;

  return [...seriesList].sort((left, right) => {
    const leftTime = toTimestamp(openedAtBySeriesId[left.id]);
    const rightTime = toTimestamp(openedAtBySeriesId[right.id]);

    if (leftTime === null && rightTime === null) {
      return left.title.localeCompare(right.title);
    }

    if (leftTime === null) {
      return 1;
    }

    if (rightTime === null) {
      return -1;
    }

    if (leftTime === rightTime) {
      return left.title.localeCompare(right.title);
    }

    return (leftTime - rightTime) * direction;
  });
};
