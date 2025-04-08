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
  return (
    <Chart
      type="bar"
      data={{
        labels,
        datasets: [
          {
            label: 'Actual Sales',
            data: sales,
            backgroundColor: '#3b82f6',
            yAxisID: 'y',
          },
          {
            label: 'Goal',
            type: 'line',
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
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const goal = goals[ctx.dataIndex] || 0;
                const actual = ctx.raw as number;
                const percent = goal ? ((actual / goal) * 100).toFixed(1) : 'N/A';
                return `R${actual} (${percent}% of goal)`;
              },
            },
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
  );
};

export default RevenueChart;
