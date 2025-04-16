'use client';

import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import toast from 'react-hot-toast';

import {
  fetchSalesInRange,
  fetchCategories,
  fetchTopProductsPerMonth,
} from '@/services/adminService';
import CityHeatmapByProduct from './revenue/CityHeatmapByProduct';
import GoalEditor from './revenue/GoalEditor';
import Heatmap from './revenue/Heatmap';

import RevenueFilters from './revenue/RevenueFilters';
import TopProductGrid from './revenue/TopProductGrid';
import UserStats from './revenue/UserStats';

import dynamic from 'next/dynamic';

const WorldLeafletMap = dynamic(() => import('@/components/WorldLeafletMap'), {
  ssr: false,
});

const RevenueChart = dynamic(() => import('./revenue/RevenueChart'), {
  ssr: false,
});




const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Revenue: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [labels, setLabels] = useState<string[]>([]);
  const [sales, setSales] = useState<number[]>([]);
  const [goals, setGoals] = useState<{ [key: string]: number }>({});
  const [topProducts, setTopProducts] = useState([]);
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories initially
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Auto-refresh when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const monthLabels = monthsList.map((m) => `${m}-${startDate.getFullYear()}`);
      setLabels(monthLabels);

      const actuals: number[] = [];
      for (let i = 0; i < 12; i++) {
        const res = await fetchSalesInRange(
          new Date(startDate.getFullYear(), i, 1),
          new Date(startDate.getFullYear(), i + 1, 0)
        );
        actuals.push(res.total_sales || 0);
      }

      const dynamicGoals: { [key: string]: number } = {};
      for (let i = 0; i < actuals.length; i++) {
        const prev = i === 0 ? actuals[i] : actuals[i - 1];
        const month = monthsList[i];
        const goal = Math.round(prev * 1.5);
        dynamicGoals[month] = goal;

        if (actuals[i] < goal) {
          toast.error(`${month} missed goal by R${goal - actuals[i]}`);
        }
      }

      try {
        const top = await fetchTopProductsPerMonth(startDate, endDate, status, category);
        setTopProducts(top || []);
      } catch {
        toast.error("Failed to load top products");
      }

      setSales(actuals);
      setGoals(dynamicGoals);
      setLoading(false);
    };

    fetchData();
  }, [startDate, endDate, status, category]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow mt-6">
      <h1 className="text-3xl font-bold mb-4">📊 Revenue Dashboard</h1>

      <RevenueFilters
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        categoryOptions={categories}
        loading={loading}
      />

      <Tab.Group>
        <Tab.List className="flex flex-wrap gap-2 border-b pb-2 mb-4">
          {[
            'Overview',
            'Top Products',
            'Heatmap',
            'User Stats',
            'World Map',
            'City by Product',
            'Goal Editor',
          ].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `px-4 py-2 rounded ${
                  selected ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <RevenueChart
              labels={labels}
              sales={sales}
              goals={labels.map((m) => goals[m.split('-')[0]] || 0)}
            />
          </Tab.Panel>
          <Tab.Panel>
            <TopProductGrid labels={labels} topProducts={topProducts} />
          </Tab.Panel>
          <Tab.Panel><Heatmap /></Tab.Panel>
          <Tab.Panel><UserStats /></Tab.Panel>
          <Tab.Panel><WorldLeafletMap /></Tab.Panel>
          <Tab.Panel><CityHeatmapByProduct /></Tab.Panel>
          <Tab.Panel><GoalEditor goals={goals} setGoals={setGoals} /></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Revenue;
