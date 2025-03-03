import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchUserStatistics } from "@/services/adminService";

const UserStatistics: React.FC = () => {
  const [userStatistics, setUserStatistics] = useState({
    most_purchases_user: "",
    total_spent: 0,
  });

  useEffect(() => {
    async function getUserStatistics() {
      const data = await fetchUserStatistics();
      setUserStatistics(data);
    }

    getUserStatistics();
  }, []);

  const data = {
    labels: ["Total Spent"],
    datasets: [
      {
        label: `Total Spent by ${userStatistics.most_purchases_user}`,
        data: [userStatistics.total_spent],
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
    <div className="p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">User Statistics</h1>
      <div className="mb-6 text-center">
        <p className="text-lg text-gray-700 mb-2">
          <span className="font-semibold">User with the most purchases:</span>{" "}
          {userStatistics.most_purchases_user}
        </p>
        <p className="text-lg text-gray-700 mb-2">
          <span className="font-semibold">Total spent:</span> R
          {userStatistics.total_spent.toFixed(2)}
        </p>
      </div>
      <div className="max-w-2xl mx-auto">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default UserStatistics;
