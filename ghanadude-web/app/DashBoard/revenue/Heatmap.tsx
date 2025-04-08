import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchLocationStatistics } from "@/services/adminService";

interface Stat {
  country?: string;
  city?: string;
  total_sales: number;
}

const Heatmap: React.FC = () => {
  const [region, setRegion] = useState<"city" | "country">("country");
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchLocationStatistics(region);
      setStats(data || []);
    };
    loadStats();
  }, [region]);

  const labels = stats.map((s) => s.city || s.country || "Unknown");
  const values = stats.map((s) => s.total_sales);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">🌐 Sales by {region === "city" ? "City" : "Country"}</h2>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as "city" | "country")}
          className="border px-2 py-1 rounded"
        >
          <option value="country">Country</option>
          <option value="city">City</option>
        </select>
      </div>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: `Sales (${region})`,
              data: values,
              backgroundColor: "#3b82f6",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
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
    </div>
  );
};

export default Heatmap;
