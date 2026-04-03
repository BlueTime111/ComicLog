import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { seriesRepository } from '../../../data/repositories';
import { SeriesDetail } from '../../series/domain/series';

type LibraryScreenData = {
  isLoading: boolean;
  seriesList: SeriesDetail[];
  openedAtBySeriesId: Record<string, string | undefined>;
};

export const useLibraryScreenData = () => {
  const [state, setState] = useState<LibraryScreenData>({
    isLoading: true,
    seriesList: [],
    openedAtBySeriesId: {},
  });

  const loadData = useCallback(async () => {
    try {
      const [seriesDetails, openedList] = await Promise.all([
        seriesRepository.listSeriesDetails(),
        seriesRepository.listSeriesLastOpened(),
      ]);

      const openedAtBySeriesId = openedList.reduce<Record<string, string | undefined>>((acc, item) => {
        acc[item.seriesId] = item.openedAt;
        return acc;
      }, {});

      setState({
        isLoading: false,
        seriesList: seriesDetails,
        openedAtBySeriesId,
      });
    } catch {
      setState({
        isLoading: false,
        seriesList: [],
        openedAtBySeriesId: {},
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setState((current) => ({ ...current, isLoading: true }));
      loadData();
    }, [loadData]),
  );

  return state;
};
