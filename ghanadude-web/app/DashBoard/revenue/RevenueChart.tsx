'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TooltipItem,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

interface Props {
  labels: string[];
  sales: number[];
  goals: number[];
}

const RevenueChart: React.FC<Props> = ({ labels, sales, goals }) => {
  const data: ChartData<'bar' | 'line', number[], string> = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Actual Sales',
        data: sales,
        backgroundColor: '#3b82f6',
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Goal',
        data: goals,
        borderColor: '#f97316',
        borderWidth: 2,
        borderDash: [6, 3],
        pointRadius: 4,
        pointBackgroundColor: '#f97316',
        tension: 0.4,
        fill: false,
        yAxisID: 'y',
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar' | 'line'>) => {
            const dataIndex = ctx.dataIndex;
            const raw = ctx.raw as number;
            const goal = goals[dataIndex] || 0;

            if (ctx.dataset.type === 'bar') {
              const percent = goal ? ((raw / goal) * 100).toFixed(1) : 'N/A';
              return `R${raw} (${percent}% of goal)`;
            } else {
              return `Goal: R${raw}`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val: number | string) => `R ${val}`,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <Chart type="bar" data={data} options={options} />
    </div>
  );
};

export default RevenueChart;
