import React, { useEffect, useState } from "react";

import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchLocationStatistics } from "@/services/adminService";

const LocationStatistics: React.FC = () => {
  const [locationStatistics, setLocationStatistics] = useState([]);

  useEffect(() => {
    async function getLocationStatistics() {
      const data = await fetchLocationStatistics();
      setLocationStatistics(data);
    }

    getLocationStatistics();
  }, []);

  const data = {
    labels: locationStatistics.map((item: any) => item.country),
    datasets: [
      {
        label: "Sales",
        data: locationStatistics.map((item: any) => item.total_sales),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
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
      <h1 className="text-2xl font-bold mb-4">Location Statistics</h1>
      <Bar data={data} options={options} />
    </div>
  );
};

export default LocationStatistics;
