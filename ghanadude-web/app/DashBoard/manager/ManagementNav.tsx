// components/ManagementNav.tsx
import React from "react";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  exportCSV: () => void;
}

const ManagementNav: React.FC<Props> = ({ filter, setFilter, exportCSV }) => (
  <div className="flex gap-2">
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="px-3 py-2 rounded-lg border shadow"
    >
      <option value="last_30_days">Last 30 Days</option>
      <option value="this_month">This Month</option>
    </select>
    <button
      onClick={exportCSV}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
    >
      📥 Export CSV
    </button>
  </div>
);

export default ManagementNav;
