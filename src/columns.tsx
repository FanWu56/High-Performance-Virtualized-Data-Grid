

import type { Column, RowData } from "./types";

export const columns: Column<RowData>[] = [
  {
    key: "id",
    header: "ID",
    width: 80,
    sortable: true,
    filterable: true,
  },
  {
    key: "name",
    header: "Name",
    width: 180,
    sortable: true,
    filterable: true,
  },
  {
    key: "email",
    header: "Email",
    width: 260,
    sortable: true,
    filterable: true,
  },
  {
    key: "role",
    header: "Role",
    width: 220,
    sortable: true,
    filterable: true,
  },
  {
    key: "status",
    header: "Status",
    width: 140,
    sortable: true,
    filterable: true,
    render: (row) => {
      return (
        <span className={`status status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      );
    },
  },
  {
    key: "age",
    header: "Age",
    width: 100,
    sortable: true,
    filterable: true,
  },
  {
    key: "salary",
    header: "Salary",
    width: 140,
    sortable: true,
    filterable: true,
    render: (row) => {
      return `$${row.salary.toLocaleString()}`;
    },
  },
];