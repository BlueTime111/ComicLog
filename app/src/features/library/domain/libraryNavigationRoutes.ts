export const getLibraryCreateRoute = () => {
  return {
    name: 'SeriesManage' as const,
    params: undefined,
  };
};

export const getLibraryImportRoute = () => {
  return {
    name: 'Import' as const,
    params: undefined,
  };
};

export const getLibrarySeriesDetailRoute = (seriesId: string) => {
  return {
    name: 'SeriesDetail' as const,
    params: { seriesId },
  };
};
