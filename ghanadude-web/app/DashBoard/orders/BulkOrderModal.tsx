'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { Fragment } from 'react';
import { BulkOrder } from './types';
import { baseAPI } from '@/utils/variables';

interface Props {
  order: BulkOrder | null;
  onClose: () => void;
}

const BulkOrderModal: React.FC<Props> = ({ order, onClose }) => {
  if (!order) return null;

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

              <div className="mb-4 space-y-1 text-sm text-gray-700">
                <p><strong>User:</strong> {order.user}</p>
                <p><strong>Product:</strong> {order.product_name}</p>
                <p><strong>Designer:</strong> {order.designer_name}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Shipping Address:</strong> {order.address}, {order.city}, {order.postal_code}, {order.country}</p>
                <p><strong>PIN Code:</strong> {order.pin_code || 'N/A'}</p>
                <p><strong>Dispatched:</strong> {order.is_dispatched ? 'Yes' : 'No'}</p>


                <div className="flex gap-4 mt-4">
                  {order.brand_logo_url && (
                    <div className="relative w-20 h-20 rounded overflow-hidden border">
                      <Image
                        src={`${baseAPI}${order.brand_logo_url}`}
                        alt="Brand Logo"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  {order.custom_design_url && (
                    <div className="relative w-20 h-20 rounded overflow-hidden border">
                      <Image
                        src={`${baseAPI}${order.custom_design_url}`}
                        alt="Custom Design"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded"
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
