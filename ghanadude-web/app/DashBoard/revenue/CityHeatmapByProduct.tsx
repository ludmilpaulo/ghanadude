import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchProducts, fetchCitySalesByProduct } from "@/services/adminService";

interface CityStat {
  city: string;
  total_sales: number;
}

const CityHeatmapByProduct: React.FC = () => {
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [stats, setStats] = useState<CityStat[]>([]);

  useEffect(() => {
    fetchProducts().then((data) => setProducts(data));
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchCitySalesByProduct(selectedProduct).then((data) => setStats(data));
    }
  }, [selectedProduct]);

  const data = {
    labels: stats.map((s) => s.city),
    datasets: [
      {
        label: "Sales",
        data: stats.map((s) => s.total_sales),
        backgroundColor: "#facc15",
        borderColor: "#ca8a04",
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🏙️ City Sales by Product</h2>
        <select
          onChange={(e) => setSelectedProduct(Number(e.target.value))}
          value={selectedProduct || ""}
          className="border px-2 py-1 rounded"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {selectedProduct ? (
        <Bar data={data} />
      ) : (
        <p className="text-gray-600 italic">Please select a product to view stats.</p>
      )}
    </div>
  );
};

export default CityHeatmapByProduct;
