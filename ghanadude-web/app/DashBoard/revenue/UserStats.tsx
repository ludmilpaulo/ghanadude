import React, { useEffect, useState } from "react";
import { fetchTopUsers } from "@/services/adminService";

interface User {
  id: number;
  username: string;
  email: string;
  total_spent: number;
}

const UserStats: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const data = await fetchTopUsers();
      setUsers(data);
    }
    loadUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        🏅 Top 10 Users by Total Spend
      </h2>
      <ul className="divide-y">
        {users.map((user, i) => (
          <li key={user.id} className="py-2 flex justify-between">
            <span>
              {i + 1}. {user.username} ({user.email})
            </span>
            <span className="text-green-600 font-semibold">
              R {user.total_spent.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserStats;
