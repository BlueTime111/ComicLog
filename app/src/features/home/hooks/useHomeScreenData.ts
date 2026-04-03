import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { repositoryDataSource, seriesRepository } from '../../../data/repositories';
import { myComics } from '../../../data/mock/homeData';
import { getRecentlyViewedStore, setRecentlyViewedStore } from '../../../data/store/recentlyViewedStore';
import { resolveAppLocale } from '../../../i18n/locale';
import { MyComic, RecentlyViewedComic, SyncStatus } from '../../../types/comic';
import { mapSeriesToHomeComic } from '../domain/homeComicMapper';
import { resolveHomeCollection } from '../domain/homeCollection';
import { formatRelativeTime } from '../domain/formatRelativeTime';
import { buildHomeStatusLabel } from '../domain/homeStatusLabel';
import { createHomeBootstrapState } from '../domain/homeBootstrap';
import { refreshRecentlyViewedComics, touchRecentlyViewedComics } from '../domain/recentlyViewedComics';

type HomeComicMetaFallback = {
  coverColor: string;
  coverAccent: string;
  coverText: string;
  collection: 'tracking' | 'library';
  updatedAt?: string;
  updatedAgoLabel: string;
  status: SyncStatus;
  statusLabel?: string;
};

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);

const defaultMeta: HomeComicMetaFallback = {
  coverColor: '#334155',
  coverAccent: '#CBD5E1',
  coverText: 'NEW',
  collection: 'library',
  updatedAgoLabel: formatRelativeTime(new Date().toISOString(), undefined, appLocale),
  status: 'UPDATED',
};

export const useHomeScreenData = () => {
  const [computedComics, setComputedComics] = useState<MyComic[]>(() => {
    return createHomeBootstrapState(repositoryDataSource, myComics, getRecentlyViewedStore()).computedComics;
  });
  const [recentComics, setRecentComics] = useState<RecentlyViewedComic[]>(() => {
    return createHomeBootstrapState(repositoryDataSource, myComics, getRecentlyViewedStore()).recentComics;
  });

  const loadComics = useCallback(async () => {
    try {
      const [seriesDetails, updatedSeriesActivity] = await Promise.all([
        seriesRepository.listSeriesDetails(),
        seriesRepository.listRecentlyUpdatedSeries(),
      ]);
      const updatedMap = new Map(updatedSeriesActivity.map((activity) => [activity.seriesId, activity]));
      const metaMap = new Map(myComics.map((comic) => [comic.id, comic]));

      const mappedComics = seriesDetails.map((series) => {
        const meta = metaMap.get(series.id) ?? {
          ...defaultMeta,
          coverText: series.title.slice(0, 2).toUpperCase(),
        };

        const activity = updatedMap.get(series.id);
        const isRecentlyUpdated = Boolean(activity);
        const status: SyncStatus = isRecentlyUpdated ? 'UPDATED' : 'SYNCED';
        const updatedAgoLabel = isRecentlyUpdated && activity
          ? formatRelativeTime(activity.updatedAt, undefined, appLocale)
          : meta.updatedAgoLabel;
        const statusLabel = isRecentlyUpdated
          ? buildHomeStatusLabel(status, activity?.source, appLocale)
          : (meta.statusLabel ?? buildHomeStatusLabel(status, undefined, appLocale));
        const collection = resolveHomeCollection(series.chapters);

        return mapSeriesToHomeComic(series, {
          coverColor: meta.coverColor,
          coverAccent: meta.coverAccent,
          coverText: meta.coverText,
          collection,
          updatedAt: activity?.updatedAt,
          updatedAgoLabel,
          status,
          statusLabel,
        });
      });

      setComputedComics(mappedComics);
      setRecentComics((current) => {
        const next = refreshRecentlyViewedComics(current, mappedComics);
        setRecentlyViewedStore(next);
        return next;
      });
    } catch {
      setComputedComics([]);
      setRecentComics([]);
    }
  }, []);

  const markComicAsRecentlyViewed = useCallback(
    (seriesId: string) => {
      const targetComic = computedComics.find((comic) => comic.id === seriesId);
      if (!targetComic) {
        return;
      }

      setRecentComics((current) => {
        const next = touchRecentlyViewedComics(current, targetComic);
        setRecentlyViewedStore(next);
        return next;
      });
    },
    [computedComics],
  );

  useFocusEffect(
    useCallback(() => {
      loadComics();
    }, [loadComics]),
  );

  const trackingComics = useMemo(
    () => computedComics.filter((comic) => comic.collection === 'tracking'),
    [computedComics],
  );

  const libraryComics = useMemo(
    () => computedComics.filter((comic) => comic.collection === 'library'),
    [computedComics],
  );

  return {
    recentlyViewedComics: recentComics,
    trackingComics,
    libraryComics,
    markComicAsRecentlyViewed,
  };
};
