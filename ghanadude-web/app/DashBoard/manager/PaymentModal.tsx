import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { createPayment } from "@/services/EarningsService";


interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState("");
  const [invoice, setInvoice] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !invoice) {
      alert("Amount and invoice are required.");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("invoice", invoice);
    formData.append("note", note);

    setLoading(true);
    try {
      await createPayment(formData);
      onClose();
      setAmount("");
      setInvoice(null);
      setNote("");
    } catch {
      alert("Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                as={motion.div}
                className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <Dialog.Title className="text-xl font-semibold mb-4">
                  💸 Record Developer Payment
                </Dialog.Title>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount (R)"
                    className="border p-2 rounded w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <input
                    type="file"
                    className="border p-2 rounded w-full"
                    onChange={(e) => setInvoice(e.target.files?.[0] || null)}
                    required
                  />
                  <textarea
                    placeholder="Note (optional)"
                    className="border p-2 rounded w-full"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      {loading ? "Saving..." : "Save Payment"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaymentModal;
