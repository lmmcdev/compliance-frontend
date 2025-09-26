import { useState, useCallback, useMemo } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface UsePaginationResult extends PaginationState {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  goToPage: (page: number) => void;
  setTotal: (total: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  offset: number;
  hasData: boolean;
  pageSizeOptions: number[];
  getPageInfo: () => string;
}

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationResult {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const offset = useMemo(() => {
    return (page - 1) * pageSize;
  }, [page, pageSize]);

  const canGoNext = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const canGoPrevious = useMemo(() => {
    return page > 1;
  }, [page]);

  const hasData = useMemo(() => {
    return total > 0;
  }, [total]);

  const setPage = useCallback((newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages || 1));
    setPageState(clampedPage);
  }, [totalPages]);

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    // Reset to first page when page size changes
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setPage(page + 1);
    }
  }, [page, canGoNext, setPage]);

  const previousPage = useCallback(() => {
    if (canGoPrevious) {
      setPage(page - 1);
    }
  }, [page, canGoPrevious, setPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = useCallback(() => {
    if (totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, setPage]);

  const goToPage = useCallback((targetPage: number) => {
    setPage(targetPage);
  }, [setPage]);

  const getPageInfo = useCallback(() => {
    if (total === 0) {
      return 'No items';
    }

    const start = offset + 1;
    const end = Math.min(offset + pageSize, total);
    return `${start}-${end} of ${total}`;
  }, [offset, pageSize, total]);

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    goToPage,
    setTotal,
    canGoNext,
    canGoPrevious,
    offset,
    hasData,
    pageSizeOptions,
    getPageInfo,
  };
}