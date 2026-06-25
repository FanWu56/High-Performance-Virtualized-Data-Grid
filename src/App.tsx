

import { useMemo } from "react";
import "./App.css";
import { DataGrid } from "./components/DataGrid";
import { columns } from "./columns";
import { makeRows } from "./data/makeRows";

function App() {
  const rows = useMemo(() => makeRows(100_000), []);

  return (
    <main className="app">
      <h1>High-Performance Virtualized Data Grid</h1>

      <p className="description">
        Total rows: {rows.length.toLocaleString()}
      </p>

      <DataGrid rows={rows} columns={columns} />
    </main>
  );
}

export default App;