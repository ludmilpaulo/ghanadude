// components/UserCard.tsx
import React from "react";

interface UserProfile {
  phone_number: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  profile: UserProfile;
}

interface Props {
  user: User;
  onClick: (user: User) => void;
}

const getInitials = (name: string, last: string) =>
  `${name?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const UserCard: React.FC<Props> = ({ user, onClick }) => {
  return (
    <tr
      onClick={() => onClick(user)}
      className="cursor-pointer hover:bg-gray-100 transition"
    >
      <td className="px-6 py-4 font-medium text-gray-900">{user.id}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {getInitials(user.first_name, user.last_name)}
          </div>
          <span>{user.username}</span>
        </div>
      </td>
      <td className="px-6 py-4">{user.email}</td>
      <td className="px-6 py-4">
        {user.first_name} {user.last_name}
      </td>
      <td className="px-6 py-4">{user.profile?.phone_number || "-"}</td>
      <td className="px-6 py-4">
        {user.profile?.city}, {user.profile?.address}
      </td>
      <td className="px-6 py-4">{user.profile?.country}</td>
      <td className="px-6 py-4">
        {user.is_staff ? (
          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Admin
          </span>
        ) : (
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            User
          </span>
        )}
      </td>
    </tr>
  );
};

export default UserCard;
