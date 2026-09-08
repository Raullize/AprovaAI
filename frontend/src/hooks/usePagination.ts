import { useState } from 'react';

export interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  pageItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey?: string | number,
): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  const goToPage = (page: number) =>
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return {
    currentPage,
    totalPages,
    startIndex,
    pageItems,
    goToPage,
    nextPage,
    prevPage,
  };
}
