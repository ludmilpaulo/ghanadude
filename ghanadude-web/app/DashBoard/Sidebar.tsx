"use client";
import React from "react";
import {
  FiUsers,
  FiShoppingBag,
  FiBox,
  FiDollarSign,
  FiMail,
  FiSettings,
} from "react-icons/fi";

interface SidebarProps {
  setActiveComponent: (component: string) => void;
  activeComponent: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  setActiveComponent,
  activeComponent,
}) => {
  const menuItems = [
    { id: "users", label: "Users", icon: <FiUsers /> },
    { id: "orders", label: "Orders", icon: <FiShoppingBag /> },
    { id: "products", label: "Products", icon: <FiBox /> },
    { id: "revenue", label: "Revenue", icon: <FiDollarSign /> },
    { id: "emails", label: "Emails", icon: <FiMail /> },
    { id: "management", label: "Management", icon: <FiSettings /> },
  ];

  return (
    <div className="w-72 bg-gray-900 text-white shadow-lg min-h-screen flex flex-col">
      <div className="p-6 text-xl font-bold text-center bg-gray-800">
        Admin Dashboard
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`flex items-center gap-3 px-6 py-3 w-full text-left text-gray-300 transition-all 
                hover:bg-gray-800 hover:text-white ${
                  activeComponent === item.id ? "bg-gray-700 text-white" : ""
                }`}
                onClick={() => setActiveComponent(item.id)}
              >
                {item.icon} {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
