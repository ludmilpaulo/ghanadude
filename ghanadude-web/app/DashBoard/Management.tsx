"use client";
import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Dialog, Tab, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { PlusIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { baseAPI } from "@/utils/variables";

interface DevPayment {
  id: number;
  amount: number;
  created_at: string;
  invoice: string;
  note: string;
}

const Management: React.FC = () => {
  const [payments, setPayments] = useState<DevPayment[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [invoice, setInvoice] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    axios.get(`${baseAPI}/api/admin/dev-payments/`).then(res => {
      setPayments(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("amount", amount);
    if (invoice) formData.append("invoice", invoice);
    formData.append("note", note);

    axios.post(`${baseAPI}/api/admin/dev-payment/`, formData)
      .then(() => {
        fetchPayments();
        setModalOpen(false);
        setAmount("");
        setInvoice(null);
        setNote("");
      })
      .catch(() => alert("Failed to submit payment"));
  };

  return (
    <div className="p-8 space-y-6">
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-gray-200 rounded-xl p-1 w-fit">
          {["Summary", "Payment History"].map((tab) => (
            <Tab key={tab} as={Fragment}>
              {({ selected }) => (
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selected ? "bg-white shadow" : "text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Earnings Summary (existing dashboard) */}
          <Tab.Panel>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white shadow p-6 rounded-lg"
            >
              <button
                onClick={() => setModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <PlusIcon className="h-5 w-5" /> Record Payment
              </button>
            </motion.div>
          </Tab.Panel>

          {/* Payment History */}
          <Tab.Panel>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading payments...</p>
              ) : payments.length ? (
                payments.map((pay) => (
                  <motion.div
                    key={pay.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-semibold">R {pay.amount}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(pay.created_at).toLocaleDateString()} - {pay.note || "No notes"}
                      </p>
                    </div>
                    <a
                      href={pay.invoice}
                      target="_blank"
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <DocumentArrowUpIcon className="w-5 h-5" /> Invoice
                    </a>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400">No payments recorded yet.</p>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Modal for Payment Entry */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-semibold mb-4">
                    Record Developer Payment
                  </Dialog.Title>

                  <form className="space-y-4" onSubmit={submitPayment}>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Amount"
                      className="border p-2 rounded w-full"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                      type="file"
                      required
                      className="w-full"
                      onChange={(e) => setInvoice(e.target.files?.[0] || null)}
                    />
                    <textarea
                      placeholder="Note (optional)"
                      className="border p-2 rounded w-full"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Submit Payment
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Management;
