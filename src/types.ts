

import type { ReactNode } from "react";

export type RowData = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  age: number;
  salary: number;
};

export type Column<T> = {
  key: keyof T;
  header: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: T) => ReactNode;
};