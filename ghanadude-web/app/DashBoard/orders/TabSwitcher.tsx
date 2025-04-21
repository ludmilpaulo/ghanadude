import React from "react";

interface Props {
  selectedTab: "regular" | "bulk";
  onTabChange: (tab: "regular" | "bulk") => void;
}

const TabSwitcher: React.FC<Props> = ({ selectedTab, onTabChange }) => (
  <div className="flex gap-4 mb-4">
    {["regular", "bulk"].map((tab) => (
      <button
        key={tab}
        className={`px-4 py-2 rounded ${selectedTab === tab ? "bg-blue-600 text-white" : "bg-gray-300 text-black"}`}
        onClick={() => onTabChange(tab as "regular" | "bulk")}
      >
        {tab === "regular" ? "🛍 Regular Orders" : "📦 Bulk Orders"}
      </button>
    ))}
  </div>
);

export default TabSwitcher;
