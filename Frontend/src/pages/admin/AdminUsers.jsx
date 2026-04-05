import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

/* ---------- UI COMPONENTS ---------- */

const AvatarCell = ({ user }) => (
  <div className="flex items-center gap-3">
    <img
      src={
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      }
      alt={user.name}
      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
    />
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">
        {user.name}
      </p>
      <p className="text-xs text-gray-500 truncate">
        {user.title || "No Title"}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ active, isDeleted }) => {
  if (isDeleted) {
    return (
      <span className="px-2.5 py-1 text-[11px] rounded-full font-bold bg-red-50 text-red-600 border border-red-100">
        Deleted
      </span>
    );
  }
  return (
    <span
      className={`px-2.5 py-1 text-[11px] rounded-full font-bold border ${
        active
          ? "bg-green-50 text-green-700 border-green-100"
          : "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-purple-50 text-purple-700 border-purple-100",
    staff: "bg-blue-50 text-blue-700 border-blue-100",
    user: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`px-2.5 py-1 text-[11px] rounded-full font-bold border uppercase tracking-wider ${
        styles[role] || styles.user
      }`}
    >
      {role}
    </span>
  );
};

/* ---------- MAIN ---------- */

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  /* ---------- FETCH ---------- */
  const fetchUsers = useCallback(async () => {
    try {
      setStatus("loading");
      const { data } = await api.get("/users");
      setUsers(data?.data || []);
      setStatus("success");
    } catch (err) {
      console.error("Fetch users failed:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ---------- FILTERED DATA ---------- */
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const query = search.toLowerCase();
        return (
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.department?.toLowerCase().includes(query)
        );
      })
      .filter((u) => (filterRole === "all" ? true : u.role === filterRole));
  }, [users, search, filterRole]);

  /* ---------- UI ---------- */
  return (
    <div className="bg-gray-50 min-h-screen p-6 xl:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredUsers.length} of {users.length} total users
            </p>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                placeholder="Search name, email, dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
            </select>

            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* CONTENT STATE */}
        {status === "loading" ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100 text-red-500">
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">Failed to load users</p>
          </div>
        ) : (
          /* TABLE */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Contact & Dept</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Last Login</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="p-4">
                        <AvatarCell user={u} />
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-900">
                          {u.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {u.department || "No Dept"}
                        </p>
                      </td>
                      <td className="p-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="p-4">
                        <StatusBadge
                          active={u.isActive}
                          isDeleted={u.isDeleted}
                        />
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/users/${u._id}`)}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* EMPTY STATE */}
            {filteredUsers.length === 0 && (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No users found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Adjust your filters or search query.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
