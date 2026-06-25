

import { useEffect, useMemo, useRef, useState } from "react";
import type { Column } from "../types";
import { useVirtualRows } from "../hooks/useVirtualRows";

type SortDirection = "asc" | "desc";

type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
};

type DataGridProps<T> = {
  rows: T[];
  columns: Column<T>[];
  height?: number;
  rowHeight?: number;
  overscan?: number;
};

function compareValues(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

function normalizeSearchValue(value: unknown) {
  if (value == null) {
    return "";
  }

  return String(value).toLowerCase();
}

export function DataGrid<T extends { id: number }>({
  rows,
  columns,
  height = 500,
  rowHeight = 44,
  overscan = 6,
}: DataGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [filterText, setFilterText] = useState("");

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollTopRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const totalColumnsWidth = useMemo(() => {
    return columns.reduce((sum, column) => sum + column.width, 0);
  }, [columns]);

  const filterableColumns = useMemo(() => {
    return columns.filter((column) => column.filterable !== false);
  }, [columns]);

  const filteredRows = useMemo(() => {
    const query = filterText.trim().toLowerCase();

    if (query.length === 0) {
      return rows;
    }

    return rows.filter((row) => {
      return filterableColumns.some((column) => {
        const cellValue = row[column.key];
        return normalizeSearchValue(cellValue).includes(query);
      });
    });
  }, [rows, filterText, filterableColumns]);

  const sortedRows = useMemo(() => {
    if (sortConfig === null) {
      return filteredRows;
    }

    const nextRows = [...filteredRows];

    nextRows.sort((rowA, rowB) => {
      const valueA = rowA[sortConfig.key];
      const valueB = rowB[sortConfig.key];

      const result = compareValues(valueA, valueB);

      return sortConfig.direction === "asc" ? result : -result;
    });

    return nextRows;
  }, [filteredRows, sortConfig]);

  const {
    startIndex,
    endIndex,
    visibleRows,
    totalRowsHeight,
    offsetY,
  } = useVirtualRows({
    rows: sortedRows,
    scrollTop,
    viewportHeight: height,
    rowHeight,
    overscan,
  });

  function resetScrollPosition() {
    setScrollTop(0);
    pendingScrollTopRef.current = 0;

    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }

  function scheduleScrollUpdate(nextScrollTop: number) {
    pendingScrollTopRef.current = nextScrollTop;

    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setScrollTop(pendingScrollTopRef.current);
      animationFrameRef.current = null;
    });
  }

  function handleSort(column: Column<T>) {
    if (column.sortable === false) {
      return;
    }

    resetScrollPosition();

    setSortConfig((currentSort) => {
      if (currentSort?.key !== column.key) {
        return {
          key: column.key,
          direction: "asc",
        };
      }

      if (currentSort.direction === "asc") {
        return {
          key: column.key,
          direction: "desc",
        };
      }

      return null;
    });
  }

  function getSortIndicator(column: Column<T>) {
    if (sortConfig?.key !== column.key) {
      return "";
    }

    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="data-grid" style={{ width: totalColumnsWidth }}>
      <div className="data-grid-toolbar">
        <input
          className="data-grid-search"
          value={filterText}
          onChange={(event) => {
            setFilterText(event.target.value);
            resetScrollPosition();
          }}
          placeholder="Search rows..."
        />

        <span className="data-grid-count">
          Showing {sortedRows.length.toLocaleString()} of{" "}
          {rows.length.toLocaleString()} rows
        </span>
      </div>

      <div className="data-grid-header">
        {columns.map((column) => (
          <button
            key={String(column.key)}
            className="data-grid-cell data-grid-header-cell"
            style={{ width: column.width }}
            onClick={() => handleSort(column)}
            type="button"
          >
            {column.header}
            {getSortIndicator(column)}
          </button>
        ))}
      </div>

      <div
        ref={viewportRef}
        className="data-grid-viewport"
        style={{ height }}
        onScroll={(event) => {
          scheduleScrollUpdate(event.currentTarget.scrollTop);
        }}
      >
        <div
          className="data-grid-spacer"
          style={{
            height: totalRowsHeight,
            width: totalColumnsWidth,
          }}
        >
          <div
            className="data-grid-visible-rows"
            style={{
              transform: `translateY(${offsetY}px)`,
            }}
          >
            {visibleRows.map((row) => (
              <div
                key={row.id}
                className="data-grid-row"
                style={{ height: rowHeight }}
              >
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className="data-grid-cell"
                    style={{ width: column.width }}
                  >
                    {column.render
                      ? column.render(row)
                      : String(row[column.key])}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-grid-footer">
        Rendering rows {sortedRows.length === 0 ? 0 : startIndex + 1} -{" "}
        {endIndex} of {sortedRows.length.toLocaleString()} | DOM rows:{" "}
        {visibleRows.length}
      </div>
    </div>
  );
}