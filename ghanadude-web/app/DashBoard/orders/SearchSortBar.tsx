"use client";

import React from "react";

interface Props {
  statusFilter: string;
  userFilter: string;
  dateFilter: string;
  setStatusFilter: (value: string) => void;
  setUserFilter: (value: string) => void;
  setDateFilter: (value: string) => void;
}

const SearchSortBar: React.FC<Props> = ({
  statusFilter,
  userFilter,
  dateFilter,
  setStatusFilter,
  setUserFilter,
  setDateFilter,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <input
        type="text"
        placeholder="Filter by user"
        value={userFilter}
        onChange={(e) => setUserFilter(e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      />
      <input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      />
    </div>
  );
};

export default SearchSortBar;
