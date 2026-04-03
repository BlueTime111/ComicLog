import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { seriesRepository } from '../../../data/repositories';
import { SearchResultItem } from '../domain/searchReadSummaries';

export const useSearchScreenData = (query: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const latestRequestIdRef = useRef(0);

  const loadResults = useCallback(async (nextQuery: string) => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    try {
      const nextResults = await seriesRepository.searchReadSummaries(nextQuery);
      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setResults(nextResults);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setResults([]);
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadResults(query);
    }, [loadResults, query]),
  );

  return {
    isLoading,
    results,
  };
};
