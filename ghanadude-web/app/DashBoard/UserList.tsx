// components/UserList.tsx
import { fetchUsers } from "@/services/adminService";
import React, { useEffect, useState, useMemo } from "react";
import PaginationControls from "./user/PaginationControls";
import UserCard, { User } from "./user/UserCard";
import UserModal from "./user/UserModal";


const USERS_PER_PAGE = 10;

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadUsers() {
      const data = await fetchUsers();
      setUsers(data);
    }

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      [user.username, user.email, user.first_name, user.last_name]
        .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👥 User Directory</h1>
        <input
          type="text"
          placeholder="Search users..."
          className="border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring w-64"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
        />
      </div>

      <div className="overflow-x-auto rounded shadow-md border border-gray-200 bg-white">
        <table className="min-w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Country</th>
              <th className="px-6 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <UserCard key={user.id} user={user} onClick={setSelectedUser} />
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

export default UserList;
