"use client";

import React from "react";
import { Order } from "./types";

interface Props {
  orders: Order[];
  onStatusChange: (id: number, status: string) => void;
  onViewOrder: (order: Order) => void;
}

const OrderTable: React.FC<Props> = ({
  orders,
  onStatusChange,
  onViewOrder,
}) => {
  return (
    <table className="min-w-full bg-white divide-y divide-gray-200 shadow rounded">
      <thead className="bg-gray-100 text-sm font-semibold text-gray-600">
        <tr>
          <th className="px-4 py-2 text-left">ID</th>
          <th className="px-4 py-2 text-left">User</th>
          <th className="px-4 py-2 text-left">Total</th>
          <th className="px-4 py-2 text-left">Discount</th>
          <th className="px-4 py-2 text-left">Delivery Fee</th>
          <th className="px-4 py-2 text-left">VAT</th>
          <th className="px-4 py-2 text-left">Order Type</th>
          <th className="px-4 py-2 text-left">Payment</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2 text-left">Date</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-4 py-2">{order.id}</td>
            <td className="px-4 py-2">{order.user}</td>
            <td className="px-4 py-2">R{order.total_price}</td>
            <td className="px-4 py-2">R{order.discount_amount}</td>
            <td className="px-4 py-2">R{order.delivery_fee}</td>
            <td className="px-4 py-2">R{order.vat_amount}</td>
            <td className="px-4 py-2 capitalize">{order.order_type}</td>
            <td className="px-4 py-2 capitalize">{order.payment_method}</td>
            <td className="px-4 py-2">
              <select
                className={`px-2 py-1 text-xs rounded-full border ${
                  order.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                }`}
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
              >
                {["Pending", "Processing", "Completed", "Cancelled"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </td>
            <td className="px-4 py-2">
              {new Date(order.created_at).toLocaleDateString()}
            </td>
            <td className="px-4 py-2">
              <button
                onClick={() => onViewOrder(order)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
