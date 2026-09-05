import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/services/api/search.api';

export function useGlobalSearch(query: string, delay: number = 200) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  const searchQuery = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => searchApi.globalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 10000,
  });

  return {
    results: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    isFetching: searchQuery.isFetching,
    debouncedQuery,
  };
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(searchApi.getRecentSearches());
  }, []);

  const addSearch = (term: string) => {
    searchApi.saveRecentSearch(term);
    setRecentSearches(searchApi.getRecentSearches());
  };

  const clearSearches = () => {
    searchApi.clearRecentSearches();
    setRecentSearches([]);
  };

  return {
    recentSearches,
    addSearch,
    clearSearches,
  };
}
