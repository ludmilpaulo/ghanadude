'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Order } from './types';

interface Props {
  order: Order | null;
  onClose: () => void;
}

const OrderModal: React.FC<Props> = ({ order, onClose }) => {
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
                Order #{order.id} Details
              </Dialog.Title>

              <div className="mb-4 space-y-1 text-sm text-gray-700">
                <p><strong>User:</strong> {order.user}</p>
                <p><strong>Total:</strong> R{order.total_price}</p>
                {order.reward_applied && parseFloat(order.reward_applied) > 0 && (
                  <p>
                    <strong>Reward Applied:</strong> -R{parseFloat(order.reward_applied).toFixed(2)}
                  </p>
                )}
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Payment:</strong> {order.payment_method}</p>
                <p>
                  <strong>Shipping:</strong> {order.address}, {order.city}, {order.country},{' '}
                  {order.postal_code}
                </p>
                <p><strong>PIN Code:</strong> {order.pin_code || 'N/A'}</p>
                <p><strong>Dispatched:</strong> {order.is_dispatched ? 'Yes' : 'No'}</p>

                {order.invoice && (
                  <a
                    href={order.invoice}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📄 View Invoice
                  </a>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">🛍️ Items</h4>
                {order.items.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items in this order.</p>
                ) : (
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-700 border-b pb-1">
                        <p>
                          <span className="font-medium">{item.product_name}</span>{' '}
                          ({item.selected_size || 'N/A'}) × {item.quantity} ={' '}
                          <span className="font-semibold">
                            R{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
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

export default OrderModal;
