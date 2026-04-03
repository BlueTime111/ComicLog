type SeriesActivityRecord = {
  updatedAt: string;
  source: 'edit' | 'import';
};

const updatedSeriesMap = new Map<string, SeriesActivityRecord>();

export const markSeriesUpdated = (
  seriesId: string,
  source: 'edit' | 'import',
  updatedAt: string = new Date().toISOString(),
) => {
  updatedSeriesMap.set(seriesId, { updatedAt, source });
};

export const listUpdatedSeriesActivity = (): {
  seriesId: string;
  updatedAt: string;
  source: 'edit' | 'import';
}[] => {
  return Array.from(updatedSeriesMap.entries())
    .map(([seriesId, record]) => ({
      seriesId,
      updatedAt: record.updatedAt,
      source: record.source,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const resetSeriesActivityStore = () => {
  updatedSeriesMap.clear();
};
