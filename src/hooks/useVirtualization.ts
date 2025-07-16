import { useState, useEffect, useMemo, useCallback } from "react";

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

export const useVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions,
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 100,
  } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan,
    );
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2,
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, index) => ({
        item,
        index: visibleRange.startIndex + index,
      }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;

      // Only update if scroll difference is significant
      if (Math.abs(newScrollTop - scrollTop) > threshold) {
        setScrollTop(newScrollTop);
      }
    },
    [scrollTop, threshold],
  );

  // Check if we need to load more data (for infinite scroll)
  const shouldLoadMore = useMemo(() => {
    const buffer = overscan * itemHeight;
    return scrollTop + containerHeight >= totalHeight - buffer;
  }, [scrollTop, containerHeight, totalHeight, overscan, itemHeight]);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    shouldLoadMore,
    isNearEnd: shouldLoadMore,
  };
};

// Hook for managing paginated data with virtualization
export const usePaginatedVirtualization = <T>(
  fetchData: (
    page: number,
    pageSize: number,
  ) => Promise<{ items: T[]; totalCount: number; totalPages: number }>,
  pageSize: number = 20,
) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchData(page, pageSize);
        setData(result.items);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
        setCurrentPage(page);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "حدث خطأ أثناء تحميل البيانات",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchData, pageSize],
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        loadPage(page);
      }
    },
    [loadPage, totalPages, currentPage],
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Initial load
  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  return {
    data,
    currentPage,
    totalPages,
    totalCount,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    refresh: () => loadPage(currentPage),
  };
};
