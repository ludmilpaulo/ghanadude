// components/UserModal.tsx
import React from "react";
import { User } from "./UserCard";

interface Props {
  user: User | null;
  onClose: () => void;
}

const UserModal: React.FC<Props> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">User Details</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Name:</strong> {user.first_name} {user.last_name}
          </p>
          <p>
            <strong>Phone:</strong> {user.profile?.phone_number}
          </p>
          <p>
            <strong>Address:</strong> {user.profile?.address},{" "}
            {user.profile?.city}
          </p>
          <p>
            <strong>Country:</strong> {user.profile?.country}
          </p>
          <p>
            <strong>Role:</strong> {user.is_staff ? "Admin" : "User"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
