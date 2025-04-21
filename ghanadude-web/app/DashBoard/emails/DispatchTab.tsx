"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { baseAPI } from "@/utils/variables";
import { fetchBulkOrders, fetchOrders } from "@/services/adminService";

interface Order {
  id: number;
  status: string;
  address: string;
  city: string;
  country: string;
  dispatched: boolean;
  user: string;
  pin_code?: string;
  is_dispatched?: boolean; // fallback support
}

const DispatchTab: React.FC = () => {
  const [regularOrders, setRegularOrders] = useState<Order[]>([]);
  const [bulkOrders, setBulkOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"regular" | "bulk">("regular");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        if (activeTab === "regular") {
          const data = await fetchOrders();
          setRegularOrders(data);
        } else {
          const data = await fetchBulkOrders();
          console.log("bulk order", data);
          setBulkOrders(data);
        }
      } catch (err) {
        console.error(`❌ Failed to fetch ${activeTab} orders:`, err);
        setMessage(`Failed to load ${activeTab} orders.`);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [activeTab]);

  const handleDispatch = async (orderId: number) => {
    setSending(orderId);
    try {
      const res = await axios.post(`${baseAPI}/api/dispatch-order/`, {
        order_id: orderId,
        type: activeTab,
      });
      setMessage(res.data.message);
      setCurrentPage(1);
    } catch {
      setMessage("Error dispatching order.");
    } finally {
      setSending(null);
    }
  };

  const filteredOrders = (
    activeTab === "regular" ? regularOrders : bulkOrders
  ).filter(
    (order) =>
      order.id.toString().includes(searchQuery) ||
      order.user.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        🚚 Dispatch Orders
      </h3>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          onClick={() => setActiveTab("regular")}
          className={`w-36 ${activeTab === "regular" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Regular Orders
        </Button>
        <Button
          onClick={() => setActiveTab("bulk")}
          className={`w-36 ${activeTab === "bulk" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Bulk Orders
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Order ID or User Name..."
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin text-gray-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {currentOrders.map((order) => (
            <div
              key={order.id}
              className="relative bg-white shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 ease-in-out p-6 flex justify-between items-center space-x-6"
            >
              {/* Dispatched Badge */}
              {order.is_dispatched && (
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  ✅ Dispatched
                </span>
              )}

              <div className="flex flex-col">
                <h4 className="text-xl font-semibold text-gray-800">
                  Order #{order.id}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>User:</strong> {order.user}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Address:</strong> {order.address}, {order.city},{" "}
                  {order.country}
                </p>
                <p
                  className={`mt-2 text-sm ${order.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}
                >
                  <strong>Status:</strong> {order.status}
                </p>

                {order.is_dispatched && order.pin_code && (
                  <p className="mt-2 text-sm text-indigo-600 font-semibold">
                    <strong>PIN Code:</strong> {order.pin_code}
                  </p>
                )}
              </div>

              {/* Action Button */}
              {!order.is_dispatched && (
                <div className="flex flex-col items-center justify-center">
                  <Button
                    onClick={() => handleDispatch(order.id)}
                    disabled={sending === order.id}
                    className="w-36 bg-blue-600 text-white"
                  >
                    {sending === order.id ? (
                      <Loader2 className="animate-spin text-white w-5 h-5" />
                    ) : (
                      "Dispatch Now"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-4">
        <Button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-400 text-white w-32"
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="bg-gray-400 text-white w-32"
        >
          Next
        </Button>
      </div>

      {/* Message */}
      {message && (
        <p
          className={`mt-6 text-center text-sm font-semibold ${
            message.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default DispatchTab;
