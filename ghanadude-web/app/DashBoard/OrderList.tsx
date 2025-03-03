import React, { useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus } from "@/services/adminService";
import { Transition } from "@headlessui/react";

// Define the Order and OrderItem types
interface OrderItem {
  id: number;
  product_name: string; // Use product_name instead of product.name
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  user:  string;
  total_price: number;
  status: string;
  created_at: string;
  address: string;
  items: OrderItem[];
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const data = await fetchOrders();
      console.log("Orders fetched", data);
      setOrders(data);
      setLoading(false);
    }

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const order = orders.find((order) => order.id === orderId);
    if (
      order &&
      (order.status === "Completed" || order.status === "Cancelled")
    ) {
      setAlert(
        "This order is already marked as Completed or Cancelled. Please contact the admin to make changes.",
      );
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    try {
      setLoading(true);
      await updateOrderStatus(orderId, { status: newStatus });
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      );
      setOrders(updatedOrders);
      setLoading(false);
      setAlert("Order status updated successfully!");
      setTimeout(() => setAlert(null), 5000);
    } catch (error) {
      console.error("Failed to update order status:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {alert && (
        <div
          className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3"
          role="alert"
        >
          <p className="font-bold">Notice</p>
          <p className="text-sm">{alert}</p>
        </div>
      )}

      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
        </div>
      </Transition>

      <table className="w-full table-auto bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Total Price</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Address</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="px-4 py-2">{order.id}</td>
              <td className="px-4 py-2">{order.user}</td>
              <td className="px-4 py-2">{order.total_price}</td>
              <td className="px-4 py-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td className="px-4 py-2">{order.created_at}</td>
              <td className="px-4 py-2">{order.address}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => setViewingOrder(order)}
                >
                  View Products
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewingOrder && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Order Products</h2>
          <ul className="list-disc text-white ml-6">
            {viewingOrder.items.map((item) => (
              <li key={item.id}>
                {item.product_name} - Quantity: {item.quantity} - Price: {item.price}
              </li>
            ))}
          </ul>
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => setViewingOrder(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;
