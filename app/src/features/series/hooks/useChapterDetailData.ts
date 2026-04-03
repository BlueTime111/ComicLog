import { useCallback, useEffect, useMemo, useState } from 'react';

import { seriesRepository } from '../../../data/repositories';
import { buildChapterLayersView } from '../domain/chapterLayers';
import { SeriesChapter } from '../domain/recap';

type UseChapterDetailState = {
  isLoading: boolean;
  isSaving: boolean;
  seriesTitle: string | null;
  chapter: SeriesChapter | null;
};

export const useChapterDetailData = (seriesId: string, chapterId: string) => {
  const [state, setState] = useState<UseChapterDetailState>({
    isLoading: true,
    isSaving: false,
    seriesTitle: null,
    chapter: null,
  });

  const load = useCallback(async () => {
    const detail = await seriesRepository.getSeriesDetail(seriesId);

    const chapter = detail?.chapters.find((item) => item.id === chapterId) ?? null;

    setState((current) => ({
      ...current,
      isLoading: false,
      seriesTitle: detail?.title ?? null,
      chapter,
    }));
  }, [seriesId, chapterId]);

  useEffect(() => {
    let active = true;

    setState((current) => ({ ...current, isLoading: true }));
    load().catch(() => {
      if (!active) {
        return;
      }

      setState((current) => ({ ...current, isLoading: false }));
    });

    return () => {
      active = false;
    };
  }, [load]);

  const saveChapterSummary = useCallback(
    async (nextSharedSummary: string, nextPrivateNote: string): Promise<boolean> => {
      setState((current) => ({ ...current, isSaving: true }));

      try {
        const changed = await seriesRepository.updateChapterSummary(seriesId, chapterId, {
          oneLineSummary: nextSharedSummary,
          privateNote: nextPrivateNote || null,
        });

        await load();
        return changed;
      } catch {
        return false;
      } finally {
        setState((current) => ({ ...current, isSaving: false }));
      }
    },
    [seriesId, chapterId, load],
  );

  const setChapterRead = useCallback(
    async (isRead: boolean): Promise<boolean> => {
      try {
        const success = await seriesRepository.setChapterRead(seriesId, chapterId, isRead);
        if (success) {
          await load();
        }
        return success;
      } catch {
        return false;
      }
    },
    [seriesId, chapterId, load],
  );

  const layers = useMemo(() => {
    if (!state.chapter) {
      return null;
    }

    return buildChapterLayersView(state.chapter);
  }, [state.chapter]);

  return {
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    seriesTitle: state.seriesTitle,
    chapter: state.chapter,
    layers,
    saveChapterSummary,
    setChapterRead,
  };
};
