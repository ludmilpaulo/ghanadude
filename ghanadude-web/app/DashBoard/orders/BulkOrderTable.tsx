// app/DashBoard/orders/BulkOrderTable.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { BulkOrder } from './types';
import { baseAPI } from '@/utils/variables';



interface Props {
  orders: BulkOrder[];
  onStatusChange: (id: number, status: string) => void;
  onViewOrder: (order: BulkOrder) => void;
}

const BulkOrderTable: React.FC<Props> = ({ orders, onStatusChange, onViewOrder }) => {
  
  return (
    <table className="min-w-full bg-white divide-y divide-gray-200 shadow rounded">
      <thead className="bg-gray-100 text-sm font-semibold text-gray-600">
        <tr>
          <th className="px-4 py-2 text-left">ID</th>
          <th className="px-4 py-2 text-left">User</th>
          <th className="px-4 py-2 text-left">Product</th>
          <th className="px-4 py-2 text-left">Designer</th>
          <th className="px-4 py-2 text-left">Quantity</th>
          <th className="px-4 py-2 text-left">Logo</th>
          <th className="px-4 py-2 text-left">Design</th>
          <th className="px-4 py-2 text-left">Order Type</th>
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
            <td className="px-4 py-2">{order.product_name}</td>
            <td className="px-4 py-2">{order.designer_name}</td>
            <td className="px-4 py-2">{order.quantity}</td>
            <td className="px-4 py-2">
              {order.brand_logo_url ? (
                <div className="relative w-10 h-10 rounded overflow-hidden border">
                  <Image
                    src={`${baseAPI}${order.brand_logo_url}`}
                    alt="Logo"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </td>
            <td className="px-4 py-2">
              {order.custom_design_url ? (
                <div className="relative w-10 h-10 rounded overflow-hidden border">
                  <Image
                    src={`${baseAPI}${order.custom_design_url}`}
                    alt="Design"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </td>
            <td className="px-4 py-2 capitalize">{order.order_type}</td>
            <td className="px-4 py-2">
              <select
                className={`px-2 py-1 text-xs rounded-full border ${
                  order.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.status === 'Processing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
              >
                {['Pending', 'Processing', 'Completed', 'Cancelled'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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

export default BulkOrderTable;
