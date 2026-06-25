

import { useMemo } from "react";

type UseVirtualRowsOptions<T> = {
  rows: T[];
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  overscan: number;
};

type UseVirtualRowsResult<T> = {
  startIndex: number;
  endIndex: number;
  visibleRows: T[];
  totalRowsHeight: number;
  offsetY: number;
};

export function useVirtualRows<T>({
  rows,
  scrollTop,
  viewportHeight,
  rowHeight,
  overscan,
}: UseVirtualRowsOptions<T>): UseVirtualRowsResult<T> {
  return useMemo(() => {
    const totalRowsHeight = rows.length * rowHeight;

    const rawStartIndex = Math.floor(scrollTop / rowHeight) - overscan;
    const rawEndIndex =
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan;

    const startIndex = Math.max(0, Math.min(rows.length, rawStartIndex));
    const endIndex = Math.max(
      startIndex,
      Math.min(rows.length, rawEndIndex)
    );

    const visibleRows = rows.slice(startIndex, endIndex);
    const offsetY = startIndex * rowHeight;

    return {
      startIndex,
      endIndex,
      visibleRows,
      totalRowsHeight,
      offsetY,
    };
  }, [rows, scrollTop, viewportHeight, rowHeight, overscan]);
}