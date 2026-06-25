

import type { RowData } from "../types";

const roles = ["Frontend Engineer", "Backend Engineer", "Designer", "Product Manager"];
const statuses: RowData["status"][] = ["Active", "Inactive", "Pending"];

export function makeRows(count: number): RowData[] {
  return Array.from({ length: count }, (_, index) => {
    return {
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: roles[index % roles.length],
      status: statuses[index % statuses.length],
      age: 20 + (index % 35),
      salary: 50000 + (index % 80000),
    };
  });
}