"use client";
import React from "react";

interface SidebarProps {
  setActiveComponent: (component: string) => void;
  activeComponent: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  setActiveComponent,
  activeComponent,
}) => {
  return (
    <div
      className="w-64 bg-gradient-to-r from-blue-500 via-blue-700 to-blue-900
    shadow-md min-h-screen"
    >
      <nav className="p-4">
        <ul>
          <li
            className={`cursor-pointer p-2 ${activeComponent === "users" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveComponent("users")}
          >
            Users
          </li>
        
          <li
            className={`cursor-pointer p-2 ${activeComponent === "orders" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveComponent("orders")}
          >
            Orders
          </li>
          <li
            className={`cursor-pointer p-2 ${activeComponent === "products" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveComponent("products")}
          >
            Products
          </li>
          <li
            className={`cursor-pointer p-2 ${activeComponent === "revenue" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveComponent("revenue")}
          >
            Revenue
          </li>
          <li
            className={`cursor-pointer p-2 ${activeComponent === "user_statistics" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveComponent("user_statistics")}
          >
            User Statistics
          </li>
          <li
            className={`cursor-pointer p-2 ${activeComponent === "location_statistics" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveComponent("location_statistics")}
          >
            Location Statistics
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
