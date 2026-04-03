import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { seriesRepository } from '../../../data/repositories';
import { resolveAppLocale } from '../../../i18n/locale';
import { buildReadRecap, getReadableChapters } from '../domain/recap';
import { SeriesDetail } from '../domain/series';
import { SeriesUpdateActivity } from '../domain/seriesRepository';
import { buildSeriesUpdateMeta } from '../domain/seriesUpdateMeta';

type UseSeriesDetailDataState = {
  detail: SeriesDetail | null;
  isLoading: boolean;
  latestActivity: SeriesUpdateActivity | null;
};

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);

export const useSeriesDetailData = (seriesId: string) => {
  const [state, setState] = useState<UseSeriesDetailDataState>({
    detail: null,
    isLoading: true,
    latestActivity: null,
  });

  useFocusEffect(
    useCallback(() => {
    let active = true;

    const loadDetail = async () => {
      try {
        const [detail, activityList] = await Promise.all([
          seriesRepository.getSeriesDetail(seriesId),
          seriesRepository.listRecentlyUpdatedSeries(),
        ]);
        const latestActivity = activityList.find((activity) => activity.seriesId === seriesId) ?? null;

        if (detail) {
          seriesRepository.markSeriesOpened(seriesId).catch(() => {});
        }

        if (!active) {
          return;
        }

        setState({
          detail,
          isLoading: false,
          latestActivity,
        });
      } catch {
        if (!active) {
          return;
        }

        setState({
          detail: null,
          isLoading: false,
          latestActivity: null,
        });
      }
    };

    setState((current) => ({ ...current, isLoading: true }));
    loadDetail().catch(() => {
      if (!active) {
        return;
      }

      setState({
        detail: null,
        isLoading: false,
        latestActivity: null,
      });
    });

    return () => {
      active = false;
    };
    }, [seriesId]),
  );

  const readableChapters = useMemo(() => {
    if (!state.detail) {
      return [];
    }

    return getReadableChapters(state.detail.chapters, state.detail.lastReadChapterNumber);
  }, [state.detail]);

  const recap = useMemo(() => {
    if (!state.detail) {
      return buildReadRecap([], '0');
    }

    return buildReadRecap(state.detail.chapters, state.detail.lastReadChapterNumber);
  }, [state.detail]);

  const updateMeta = useMemo(
    () => buildSeriesUpdateMeta(state.latestActivity, undefined, appLocale),
    [state.latestActivity],
  );

  return {
    detail: state.detail,
    isLoading: state.isLoading,
    readableChapters,
    recap,
    updateMeta,
  };
};
