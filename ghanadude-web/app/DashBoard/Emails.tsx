"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Truck, Headphones } from "lucide-react";
import DispatchTab from "./emails/DispatchTab";
import PromotionsTab from "./emails/PromotionsTab";
import SupportTab from "./emails/SupportTab";

const tabConfig = [
  { name: "Promotions", icon: <Mail size={18} /> },
  { name: "Dispatch", icon: <Truck size={18} /> },
  { name: "Support", icon: <Headphones size={18} /> },
];

const Emails: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Promotions");

  const renderContent = () => {
    switch (activeTab) {
      case "Promotions":
        return <PromotionsTab />;
      case "Dispatch":
        return <DispatchTab />;
      case "Support":
        return <SupportTab />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Email Notifications
      </h2>

      <div className="flex space-x-4 border-b pb-2 mb-6">
        {tabConfig.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 font-medium rounded-md transition-all ${
              activeTab === tab.name
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:text-blue-500 hover:bg-gray-100"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Emails;
