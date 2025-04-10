"use client";
import React, { useEffect, useState, useCallback, Fragment } from "react";
import { Tab } from "@headlessui/react";
import { motion } from "framer-motion";
import { fetchEarnings, fetchPayments } from "@/services/EarningsService";
import EarningsSummary from "./manager/EarningsSummary";
import ManagementNav from "./manager/ManagementNav";
import PaymentHistory from "./manager/PaymentHistory";
import { Earnings, DevPayment } from "./manager/types";
import PaymentModal from "./manager/PaymentModal";


const Management: React.FC = () => {
  const [earnings, setEarnings] = useState<Earnings | null>(null);

  const [payments, setPayments] = useState<DevPayment[]>([]);
  const [filter, setFilter] = useState("last_30_days");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    const data = await fetchEarnings(filter);
    setEarnings(data);
    setLoading(false);
  }, [filter]);

  const loadPayments = useCallback(async () => {
    setPayments(await fetchPayments());
  }, []);

  useEffect(() => {
    loadEarnings();
    loadPayments();
  }, [loadEarnings, loadPayments]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">💼 Developer Earnings Summary</h2>
        <ManagementNav filter={filter} setFilter={setFilter} exportCSV={() => { /* use previous export logic */ }} />
      </div>

      <Tab.Group>
        <Tab.List className="mb-4">
          {["Earnings Summary", "Payment History"].map(tab => (
            <Tab key={tab} as={Fragment}>
              {({ selected }) => (
                <button className={`px-4 py-2 rounded ${selected ? "bg-gray-200" : ""}`}>
                  {tab}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            {loading ? <p>Loading...</p> : <EarningsSummary earnings={earnings} />}
            <button onClick={() => setModalOpen(true)} className="mt-4 bg-green-500 text-white py-2 px-4 rounded shadow">Record Payment</button>
          </Tab.Panel>
          <Tab.Panel>
            <PaymentHistory payments={payments} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <PaymentModal isOpen={modalOpen} onClose={() => {
        setModalOpen(false);
        loadPayments();
        loadEarnings();
      }} />
    </motion.div>
  );
};

export default Management;
