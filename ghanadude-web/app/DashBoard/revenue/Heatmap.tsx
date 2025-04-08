'use client';

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchLocationStatistics } from '@/services/adminService';
import { Transition } from '@headlessui/react';

interface Point {
  name: string;
  lat: number;
  lng: number;
  total_sales: number;
}

interface Threshold {
  min: number;
  max: number;
  color: string;
}

const Heatmap: React.FC = () => {
  const [region, setRegion] = useState<'city' | 'country'>('country');
  const [points, setPoints] = useState<Point[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const response = await fetchLocationStatistics(region);
      setPoints(response.points || []);
      setThresholds(response.thresholds || []);
      setLoading(false);
    };
    loadStats();
  }, [region]);

  const labels = points.map((p) => p.name);
  const values = points.map((p) => p.total_sales);
  const totalSales = values.reduce((sum, val) => sum + val, 0);

  return (
    <div className="relative bg-white p-6 rounded-xl shadow-md max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            📍 Sales by {region === 'city' ? 'City' : 'Country'}
          </h2>
          <p className="text-gray-500 text-sm">Total Revenue: <strong>R{totalSales.toLocaleString()}</strong></p>
        </div>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as 'city' | 'country')}
          className="border px-4 py-2 rounded-md shadow-sm text-sm"
        >
          <option value="country">🌍 Country</option>
          <option value="city">🏙️ City</option>
        </select>
      </div>

      {/* Loading */}
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="w-12 h-12 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
        </div>
      </Transition>

      {/* Chart */}
      {!loading && (
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: `Sales (${region})`,
                data: values,
                backgroundColor: '#3b82f6',
              },
            ],
          }}
          options={{
            responsive: true,
            animation: {
              duration: 1000,
              easing: 'easeOutQuart',
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx) => `R ${ctx.raw?.toLocaleString()}`,
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (val) => `R ${val}`,
                },
              },
            },
          }}
        />
      )}

      {/* Legend */}
      {!loading && thresholds.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-lg font-medium mb-2">🧭 Revenue Tiers</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
            {thresholds.map((tier, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: tier.color }}
                ></div>
                <span>
                  R{tier.min.toLocaleString()} – R{tier.max.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
