"use client";

import React, { useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import {
  fetchBulkOrders,
  fetchOrders,
  updateBulkOrderStatus,
  updateOrderStatus,
} from "@/services/adminService";
import { Order, BulkOrder } from "./orders/types";
import OrderTable from "./orders/OrderTable";
import BulkOrderTable from "./orders/BulkOrderTable";
import OrderModal from "./orders/OrderModal";
import BulkOrderModal from "./orders/BulkOrderModal";
import ExportButtons from "./orders/ExportButtons";
import SearchSortBar from "./orders/SearchSortBar";

const OrderList: React.FC = () => {
  const [regularOrders, setRegularOrders] = useState<Order[]>([]);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | BulkOrder | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"regular" | "bulk">("regular");
  const [currentPage, setCurrentPage] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);
  const ordersPerPage = 10;

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
        setAlert(`Failed to load ${activeTab} orders.`);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [activeTab]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const isRegular = activeTab === "regular";
    const orders = isRegular ? regularOrders : bulkOrders;
    const target = orders.find((o) => o.id === orderId);

    if (!target || ["Completed", "Cancelled"].includes(target.status)) {
      setAlert("Cannot update status. Order already completed or cancelled.");
      return;
    }

    try {
      setLoading(true);
      if (isRegular) {
        await updateOrderStatus(orderId, { status: newStatus });
        setRegularOrders((prev: Order[]) =>
          prev.map((o: Order) =>
            o.id === orderId
              ? { ...o, status: newStatus as Order["status"] }
              : o,
          ),
        );
      } else {
        await updateBulkOrderStatus(orderId, { status: newStatus });
        setBulkOrders((prev: BulkOrder[]) =>
          prev.map((o: BulkOrder) =>
            o.id === orderId
              ? { ...o, status: newStatus as BulkOrder["status"] }
              : o,
          ),
        );
      }

      setAlert("✅ Order status updated.");
    } catch {
      setAlert("❌ Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = (
    activeTab === "regular" ? regularOrders : bulkOrders
  ).filter((order) => {
    const isStatusMatch = statusFilter ? order.status === statusFilter : true;
    const isUserMatch = userFilter
      ? order.user.toLowerCase().includes(userFilter.toLowerCase())
      : true;
    const isDateMatch = dateFilter
      ? new Date(order.created_at).toLocaleDateString() ===
        new Date(dateFilter).toLocaleDateString()
      : true;
    return isStatusMatch && isUserMatch && isDateMatch;
  });

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / ordersPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📦 Orders Dashboard</h1>

      {alert && <div className="mb-4 text-blue-700">{alert}</div>}

      {/* Tabs */}
      <div className="flex space-x-3 mb-4">
        {(["regular", "bulk"] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          >
            {tab === "regular" ? "🧾 Regular Orders" : "📦 Bulk Orders"}
          </button>
        ))}
      </div>

      <SearchSortBar
        statusFilter={statusFilter}
        userFilter={userFilter}
        dateFilter={dateFilter}
        setStatusFilter={setStatusFilter}
        setUserFilter={setUserFilter}
        setDateFilter={setDateFilter}
      />

      {activeTab === "regular" && (
        <div className="flex justify-end gap-4 mb-4">
          <ExportButtons orders={regularOrders} printRef={printRef} />
        </div>
      )}

      {/* Table */}
      <div ref={printRef}>
        {activeTab === "regular" ? (
          <OrderTable
            orders={currentOrders as Order[]}
            onStatusChange={handleStatusChange}
            onViewOrder={(o) => setViewingOrder(o)}
          />
        ) : (
          <BulkOrderTable
            orders={currentOrders as BulkOrder[]}
            onStatusChange={handleStatusChange}
            onViewOrder={(o) => setViewingOrder(o)}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {viewingOrder && activeTab === "regular" && (
        <OrderModal
          order={viewingOrder as Order}
          onClose={() => setViewingOrder(null)}
        />
      )}
      {viewingOrder && activeTab === "bulk" && (
        <BulkOrderModal
          order={viewingOrder as BulkOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {/* Loader */}
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
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin" />
        </div>
      </Transition>
    </div>
  );
};

export default OrderList;
