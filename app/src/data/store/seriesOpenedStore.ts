type SeriesOpenedRecord = {
  openedAt: string;
};

const seriesOpenedMap = new Map<string, SeriesOpenedRecord>();

export const markSeriesOpened = (
  seriesId: string,
  openedAt: string = new Date().toISOString(),
) => {
  seriesOpenedMap.set(seriesId, { openedAt });
};

export const listSeriesLastOpened = (): {
  seriesId: string;
  openedAt: string;
}[] => {
  return Array.from(seriesOpenedMap.entries())
    .map(([seriesId, record]) => ({
      seriesId,
      openedAt: record.openedAt,
    }))
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
};

export const clearSeriesLastOpened = (seriesId: string) => {
  seriesOpenedMap.delete(seriesId);
};

export const resetSeriesOpenedStore = () => {
  seriesOpenedMap.clear();
};
