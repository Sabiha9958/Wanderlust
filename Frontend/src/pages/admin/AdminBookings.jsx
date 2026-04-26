import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

/* ---------------- Helpers ---------------- */

const formatDate = (date, options = {}) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...options,
  });
};

const extractUser = (booking) => {
  const sourceUser = booking?.createdBy || booking?.user;

  if (!sourceUser) return null;

  if (typeof sourceUser === "object") {
    return {
      id: sourceUser._id || "",
      name: sourceUser.name || "",
      email: sourceUser.email || "",
    };
  }

  return { id: sourceUser };
};

/* ---------------- UI Components ---------------- */

const badgeStyles = {
  status: {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
  },
  payment: {
    paid: "bg-emerald-100 text-emerald-800",
    unpaid: "bg-gray-100 text-gray-700",
    refunded: "bg-purple-100 text-purple-800",
  },
};

const Badge = ({ value, type = "status" }) => {
  const normalizedValue = value?.toLowerCase?.() || "unknown";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        badgeStyles[type]?.[normalizedValue] || "bg-gray-100 text-gray-600"
      }`}
    >
      {normalizedValue}
    </span>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
  </div>
);

/* ---------------- Main Component ---------------- */

export default function AdminBookings() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setStatus("loading");
      const response = await api.get("/bookings");
      setBookings(response?.data?.data || []);
      setStatus("success");
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const extractedUser = extractUser(booking);

      const matchesFilter =
        filter === "all" ||
        booking?.status?.toLowerCase() === filter.toLowerCase();

      const searchableFields = [
        booking?._id,
        booking?.property?.title,
        booking?.userName,
        extractedUser?.name,
        extractedUser?.email,
        formatDate(booking?.createdAt, { year: "numeric" }),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchableFields.includes(term);
    });
  }, [bookings, filter, search]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((booking) => booking?.status === "pending")
        .length,
      confirmed: bookings.filter((booking) => booking?.status === "confirmed")
        .length,
      revenue: bookings.reduce(
        (total, booking) => total + (booking?.totalPrice || 0),
        0,
      ),
    };
  }, [bookings]);

  if (status === "loading") {
    return (
      <div className="p-10 text-center text-gray-500">Loading bookings...</div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load bookings.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500">
            Manage and review all customer bookings.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search by ID, guest, email, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Bookings" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Confirmed" value={stats.confirmed} />
        <StatCard
          label="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-4">Ref</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Stay</th>
                <th className="p-4">Booked On</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const extractedUser = extractUser(booking);

                  return (
                    <tr
                      key={booking._id}
                      onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                      className="cursor-pointer border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="p-4 font-mono text-xs text-gray-700">
                        #{booking?._id?.slice(-6) || "N/A"}
                      </td>

                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {extractedUser?.name ||
                            booking?.userName ||
                            "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {extractedUser?.email || "No email available"}
                        </p>
                      </td>

                      <td className="p-4 text-gray-700">
                        {formatDate(booking?.checkIn)} -{" "}
                        {formatDate(booking?.checkOut)}
                      </td>

                      <td className="p-4 text-gray-600">
                        {formatDate(booking?.createdAt, { year: "numeric" })}
                      </td>

                      <td className="p-4 text-center font-medium text-gray-900">
                        ₹{(booking?.totalPrice || 0).toLocaleString()}
                      </td>

                      <td className="space-y-1 p-4 text-center">
                        <Badge value={booking?.status} type="status" />
                        <div>
                          <Badge
                            value={booking?.paymentStatus}
                            type="payment"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
