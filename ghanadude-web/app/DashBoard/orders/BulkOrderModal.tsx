"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { BulkOrder, BulkOrderItem } from "./types";
import { fetchSiteSettings, SiteSetting } from "@/services/siteSettingService";

interface Props {
  order: BulkOrder | null;
  onClose: () => void;
}

const BulkOrderModal: React.FC<Props> = ({ order, onClose }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error("Failed to load site settings", error);
      }
    };

    loadSettings();
  }, []);

  if (!order) return null;

  const calculateItemPrice = (item: BulkOrderItem) => {
    if (!siteSettings) return 0;

    let basePrice = parseFloat(item.price) || 0;

    if (item.brand_logo) {
      basePrice += parseFloat(siteSettings.brand_price.toString());
    }

    if (item.custom_design) {
      basePrice += parseFloat(siteSettings.custom_price.toString());
    }

    return basePrice * item.quantity;
  };

  return (
    <Transition appear show={!!order} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
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
          <div className="flex items-center justify-center min-h-full p-4">
            <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <Dialog.Title className="text-xl font-bold mb-4">
                Bulk Order #{order.id}
              </Dialog.Title>

              <div className="space-y-1 text-sm text-gray-700 mb-4">
                <p><strong>User:</strong> {order.user}</p>
                <p><strong>Designer:</strong> {order.designer_name || "N/A"}</p>
                <p><strong>Order Type:</strong> {order.order_type}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Address:</strong> {order.address}, {order.city}, {order.postal_code}, {order.country}</p>
                <p><strong>PIN Code:</strong> {order.pin_code || "N/A"}</p>
                <p><strong>Dispatched:</strong> {order.is_dispatched ? "Yes" : "No"}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">📦 Items</h4>
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="border-b pb-2">
                      <p><strong>Product:</strong> {item.product_name || "Design/Logo"}</p>
                      <p><strong>Size:</strong> {item.selected_size || "N/A"}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Price:</strong> R{calculateItemPrice(item).toFixed(2)}</p>

                      {(item.brand_logo || item.custom_design) && (
                        <div className="flex gap-3 mt-2">
                          {item.brand_logo && (
                            <div className="relative w-16 h-16 rounded overflow-hidden border">
                              <Image
                                src={item.brand_logo}
                                alt="Brand Logo"
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                          )}
                          {item.custom_design && (
                            <div className="relative w-16 h-16 rounded overflow-hidden border">
                              <Image
                                src={item.custom_design}
                                alt="Custom Design"
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <p><strong>Total:</strong> R{parseFloat(order.total_price).toFixed(2)}</p>
                {order.reward_applied && parseFloat(order.reward_applied) > 0 && (
                  <p><strong>Reward Applied:</strong> -R{parseFloat(order.reward_applied).toFixed(2)}</p>
                )}
                {order.vat_amount && parseFloat(order.vat_amount) > 0 && (
                  <p><strong>VAT:</strong> R{parseFloat(order.vat_amount).toFixed(2)}</p>
                )}
                {order.delivery_fee && parseFloat(order.delivery_fee) > 0 && (
                  <p><strong>Delivery Fee:</strong> R{parseFloat(order.delivery_fee).toFixed(2)}</p>
                )}
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BulkOrderModal;
