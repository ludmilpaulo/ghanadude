import React from 'react';
import DatePicker from 'react-datepicker';
import { Transition } from '@headlessui/react';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  status: string;
  setStatus: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categoryOptions: { id: number; name: string; slug: string }[];
  loading: boolean;
}

const orderStatuses = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled'];

const RevenueFilters: React.FC<Props> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  status,
  setStatus,
  category,
  setCategory,
  categoryOptions,
  loading,
}) => {
  const applyQuickRange = (range: 'thisMonth' | 'last30') => {
    const now = new Date();
    if (range === 'thisMonth') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first);
      setEndDate(last);
    } else if (range === 'last30') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      setStartDate(start);
      setEndDate(end);
    }
  };

  const resetFilters = () => {
    setStartDate(new Date(new Date().getFullYear(), 0, 1));
    setEndDate(new Date());
    setStatus('All');
    setCategory('');
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => date && setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full border px-3 py-2 rounded shadow-sm focus:ring focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => date && setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full border px-3 py-2 rounded shadow-sm focus:ring focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:ring focus:border-blue-400"
          >
            {orderStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:ring focus:border-blue-400"
          >
            <option value="">All</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-between">
          <button
            onClick={() => applyQuickRange('thisMonth')}
            className="mb-2 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition"
          >
            This Month
          </button>
          <button
            onClick={() => applyQuickRange('last30')}
            className="mb-2 bg-indigo-600 text-white py-2 px-3 rounded hover:bg-indigo-700 transition"
          >
            Last 30 Days
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-600 text-white py-2 px-3 rounded hover:bg-gray-700 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin" />
        </div>
      </Transition>
    </>
  );
};

export default RevenueFilters;
