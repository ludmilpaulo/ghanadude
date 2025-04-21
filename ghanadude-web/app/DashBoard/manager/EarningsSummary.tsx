import React from "react";
import { motion } from "framer-motion";
import { Earnings } from "./types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface Props {
  earnings: Earnings | null;
}

const EarningsSummary: React.FC<Props> = ({ earnings }) => {
  if (!earnings) {
    return <p className="text-gray-500">Loading earnings summary...</p>;
  }

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div
          className="bg-white shadow p-4 rounded-xl"
          whileHover={{ scale: 1.05 }}
        >
          <h4 className="font-semibold">Regular Earnings</h4>
          <p className="text-2xl font-bold text-blue-500">
            R {earnings.regular_earnings.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          className="bg-white shadow p-4 rounded-xl"
          whileHover={{ scale: 1.05 }}
        >
          <h4 className="font-semibold">Bulk Earnings</h4>
          <p className="text-2xl font-bold text-indigo-500">
            R {earnings.bulk_earnings.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          className="bg-white shadow p-4 rounded-xl"
          whileHover={{ scale: 1.05 }}
        >
          <h4 className="font-semibold">Total Earnings</h4>
          <p className="text-2xl font-bold text-green-500">
            R {earnings.remaining_earnings.toFixed(2)}
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="font-bold text-xl mb-4">📆 Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earnings.monthly_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="font-bold text-xl mb-4">🧾 Earnings Per Order</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earnings.order_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="order_id"
                label={{ value: "Order ID", position: "insideBottom" }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="earnings" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default EarningsSummary;
