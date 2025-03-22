
import React, { useEffect, useState, useRef } from 'react';
import { fetchOrders, updateOrderStatus } from '@/services/adminService';
import { Dialog, Transition } from '@headlessui/react';
import { CSVLink } from 'react-csv';


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';


interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  user: string;
  total_price: number;
  status: string;
  created_at: string;
  address: string;
  items: OrderItem[];
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const [loading, setLoading] = useState(false);


  const [alert, setAlert] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setAlert('❌ Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order && ['Completed', 'Cancelled'].includes(order.status)) {
      setAlert('Order already Completed or Cancelled.');
      setTimeout(() => setAlert(null), 4000);
      return;
    }

    try {
      setLoading(true);
      await updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setAlert('✅ Order status updated!');
    } catch (error) {
      console.error('Failed to update status:', error);
      setAlert('❌ Failed to update order.');
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 4000);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['ID', 'User', 'Total', 'Status', 'Created At', 'Address']],
      body: orders.map((order) => [
        order.id,
        order.user,
        `R${order.total_price}`,
        order.status,
        new Date(order.created_at).toLocaleDateString(),
        order.address,
      ]),
    });
    doc.save('orders.pdf');
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  } as unknown as Parameters<typeof useReactToPrint>[0]);
  
  
  

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const matchesUser = userFilter
      ? order.user.toLowerCase().includes(userFilter.toLowerCase())
      : true;
    const matchesDate = dateFilter
      ? new Date(order.created_at).toLocaleDateString() ===
        new Date(dateFilter).toLocaleDateString()
      : true;
    return matchesStatus && matchesUser && matchesDate;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📦 Orders Dashboard</h1>

      {alert && <div className="mb-4 text-blue-700">{alert}</div>}

      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-3 py-2 rounded text-sm">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input type="text" placeholder="Filter by user" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="border px-3 py-2 rounded text-sm" />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border px-3 py-2 rounded text-sm" />
      </div>

      <div className="flex justify-end gap-4 mb-4">
      <span>
  <CSVLink
    data={orders}
    filename="orders.csv"
    className="bg-green-600 text-white px-4 py-2 rounded text-sm"
  >
    Export CSV
  </CSVLink>
</span>


        <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded text-sm">Export PDF</button>
        <button onClick={() => handlePrint?.()} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">
  Print
</button>

      </div>

      <div ref={printRef} className="overflow-x-auto border rounded bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {['ID', 'User', 'Total', 'Status', 'Date', 'Address', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {currentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{order.id}</td>
                <td className="px-6 py-4">{order.user}</td>
                <td className="px-6 py-4">R{order.total_price}</td>
                <td className="px-6 py-4">
                  <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border px-2 py-1 rounded">
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">{order.address}</td>
                <td className="px-6 py-4">
                  <button onClick={() => setViewingOrder(order)} className="bg-blue-500 text-white px-3 py-1 rounded">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">← Prev</button>
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next →</button>
        </div>
      )}

      <Transition appear show={!!viewingOrder} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setViewingOrder(null)}>
          <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4">
              <Dialog.Panel className="bg-white max-w-md w-full rounded p-6 shadow-lg">
                <Dialog.Title className="text-lg font-semibold mb-4">Order #{viewingOrder?.id} Products</Dialog.Title>
                <ul className="space-y-2">
                  {viewingOrder?.items.map((item) => (
                    <li key={item.id}>
                      {item.product_name} - Qty: {item.quantity} - R{item.price}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setViewingOrder(null)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Close</button>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default OrderList;
