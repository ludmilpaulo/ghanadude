import React from "react";
import { DevPayment } from "./types";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

interface Props {
  payments: DevPayment[];
}

const PaymentHistory: React.FC<Props> = ({ payments }) => (
  <div className="space-y-4">
    {payments.map((payment) => (
      <div
        key={payment.id}
        className="bg-white shadow p-4 rounded-xl flex justify-between items-center"
      >
        <div>
          <strong>R {Number(payment.amount).toFixed(2)}</strong>

          <div className="text-sm text-gray-500">
            {payment.note || "No notes"}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(payment.created_at).toLocaleDateString()}
          </div>
        </div>
        <a
          href={payment.invoice}
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          <DocumentArrowUpIcon className="w-5 h-5" />
        </a>
      </div>
    ))}
  </div>
);

export default PaymentHistory;
