import React, { useEffect, useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

/* ---------- UI PRIMITIVES ---------- */

const Badge = ({ value, type = "status" }) => {
  const map = {
    status: {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      "checked-in": "bg-indigo-100 text-indigo-800 border-indigo-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-rose-100 text-rose-800 border-rose-200",
    },
    payment: {
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
      unpaid: "bg-gray-100 text-gray-700 border-gray-200",
      "partially-paid": "bg-amber-100 text-amber-800 border-amber-200",
      refunded: "bg-purple-100 text-purple-800 border-purple-200",
    },
  };

  const style = map[type][value] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${style}`}
    >
      {value || "unknown"}
    </span>
  );
};

const StatCard = ({ label, value, icon, colorClass }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}
    >
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

/* ---------- MAIN COMPONENT ---------- */

const AdminBookings = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  /* ---------- FETCH ---------- */
  const fetchBookings = async () => {
    try {
      setStatus("loading");
      const { data } = await api.get("/bookings");
      setBookings(data.data || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  /* ---------- FILTER ---------- */
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = filter === "all" || b.status === filter;
      const term = search.toLowerCase();

      // Search by ID, Property Title, or manually injected UserName
      const matchSearch =
        b._id.includes(term) ||
        b.property?.title?.toLowerCase().includes(term) ||
        b.userName?.toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });
  }, [bookings, filter, search]);

  /* ---------- STATS ---------- */
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  /* ---------- RENDER STATES ---------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-100">
          <p className="text-red-600 font-semibold mb-4">
            Failed to load bookings.
          </p>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all guest bookings and payments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                placeholder="Search property, user, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-40 border border-gray-200 px-4 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked-in</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* STATS WIDGETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Bookings"
            value={stats.total}
            icon="📅"
            colorClass="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Pending Approval"
            value={stats.pending}
            icon="⏳"
            colorClass="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            icon="✅"
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            icon="❌"
            colorClass="bg-rose-50 text-rose-600"
          />
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Booking Ref</th>
                  <th className="p-4 font-semibold">Property & Guest</th>
                  <th className="p-4 font-semibold">Stay Dates</th>
                  <th className="p-4 font-semibold text-center">Amount</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.length > 0 ? (
                  filtered.map((b) => {
                    const prop = b.property;
                    return (
                      <tr
                        key={b._id}
                        onClick={() => navigate(`/admin/bookings/${b._id}`)}
                        className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                      >
                        {/* ID */}
                        <td className="p-4">
                          <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{b._id.slice(-6).toUpperCase()}
                          </span>
                        </td>

                        {/* PROPERTY & GUEST */}
                        <td className="p-4 max-w-[250px]">
                          {prop ? (
                            <p
                              className="text-sm font-bold text-gray-900 truncate"
                              title={prop.title}
                            >
                              {prop.title}
                            </p>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              Property Deleted
                            </span>
                          )}
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {b.userName || "Unknown Guest"} • {b.guests} Guests
                          </p>
                        </td>

                        {/* DATES */}
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {new Date(b.checkIn).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                            <span className="text-gray-300">→</span>
                            <span className="font-medium text-gray-900">
                              {new Date(b.checkOut).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="p-4 text-center">
                          <p className="text-sm font-bold text-gray-900">
                            ₹{b.totalPrice?.toLocaleString()}
                          </p>
                          <div className="mt-1">
                            <Badge value={b.paymentStatus} type="payment" />
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="p-4 text-center">
                          <Badge value={b.status} />
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/bookings/${b._id}`)}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No bookings found
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Adjust filters to see results.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
