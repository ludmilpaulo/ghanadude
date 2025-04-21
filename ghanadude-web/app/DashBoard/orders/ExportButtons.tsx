// app/DashBoard/orders/ExportButtons.tsx
"use client";

import { FC } from "react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import { Order } from "./types";

interface Props {
  orders: Order[];
  printRef: React.MutableRefObject<HTMLDivElement | null>;
}

const ExportButtons: FC<Props> = ({ orders, printRef }) => {
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "User", "Total", "Status", "Date", "Address"]],
      body: orders.map((o) => [
        o.id,
        o.user,
        `R${o.total_price}`,
        o.status,
        new Date(o.created_at).toLocaleDateString(),
        `${o.address}, ${o.city}, ${o.postal_code}, ${o.country}`,
      ]),
    });
    doc.save("orders.pdf");
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current!,
  } as Parameters<typeof useReactToPrint>[0]);

  return (
    <>
      <CSVLink
        data={orders}
        filename="orders.csv"
        className="bg-green-600 text-white px-4 py-2 rounded text-sm"
      >
        Export CSV
      </CSVLink>

      <button
        onClick={exportPDF}
        className="bg-red-600 text-white px-4 py-2 rounded text-sm"
      >
        Export PDF
      </button>

      <button
        onClick={() => handlePrint?.()}
        className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
      >
        Print
      </button>
    </>
  );
};

export default ExportButtons;
