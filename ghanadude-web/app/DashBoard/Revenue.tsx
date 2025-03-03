import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchSalesSummary } from "@/services/adminService";

const Revenue: React.FC = () => {
  const [salesSummary, setSalesSummary] = useState({
    daily_sales: 0,
    monthly_sales: 0,
    yearly_sales: 0,
  });

  useEffect(() => {
    async function getSalesSummary() {
      const data = await fetchSalesSummary();
      setSalesSummary(data);
    }

    getSalesSummary();
  }, []);

  const data = {
    labels: ["Daily Sales", "Monthly Sales", "Yearly Sales"],
    datasets: [
      {
        label: "Sales",
        data: [
          salesSummary.daily_sales,
          salesSummary.monthly_sales,
          salesSummary.yearly_sales,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.2)"],
        borderColor: ["rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white">
      <h1 className="text-2xl font-bold mb-4">Revenue</h1>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Revenue;
