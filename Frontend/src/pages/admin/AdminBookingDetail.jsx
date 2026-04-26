import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

/* ---------- UTILS ---------- */

const safeValue = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return JSON.stringify(val);
  return val;
};

const extractUser = (booking) => {
  const u = booking?.createdBy || booking?.user;
  if (!u) return null;

  if (typeof u === "object") {
    return {
      id: u._id,
      name: u.name,
      email: u.email,
    };
  }

  return { id: u };
};

/* ---------- UI ---------- */

const Badge = ({ value, type = "status" }) => {
  const styles = {
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

  const style =
    styles[type]?.[value] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded border ${style}`}>
      {value || "unknown"}
    </span>
  );
};

const Field = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg border">
    <p className="text-[11px] text-gray-500 uppercase mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900">
      {safeValue(value) ?? (
        <span className="text-gray-400 italic">Not available</span>
      )}
    </p>
  </div>
);

/* ---------- MAIN ---------- */

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("loading");
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    status: "",
    paymentStatus: "",
  });

  /* ---------- FETCH ---------- */
  const fetchBooking = useCallback(async () => {
    try {
      setStatus("loading");

      const { data } = await api.get(`/bookings/${id}`);

      const bookingData = Array.isArray(data.data)
        ? data.data.find((b) => b._id === id)
        : data.data;

      setBooking(bookingData);
      setForm({
        status: bookingData?.status || "",
        paymentStatus: bookingData?.paymentStatus || "",
      });

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  /* ---------- DERIVED ---------- */
  const user = useMemo(() => extractUser(booking), [booking]);
  const property = booking?.property;

  /* ---------- ACTIONS ---------- */
  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await api.put(`/bookings/${id}`, form);
      await fetchBooking();
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking?")) return;

    await api.put(`/bookings/${id}`, {
      ...form,
      status: "cancelled",
    });

    fetchBooking();
  };

  /* ---------- STATES ---------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (status === "error" || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold">Booking not found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 mt-2">
          Go back
        </button>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border">
        <div>
          <h1 className="text-lg font-semibold">Booking #{booking._id}</h1>
          <div className="flex gap-2 mt-2">
            <Badge value={booking.status} />
            <Badge value={booking.paymentStatus} type="payment" />
          </div>
        </div>

        {booking.status !== "cancelled" && (
          <button
            onClick={handleCancel}
            className="text-red-600 border px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* BOOKING */}
        <div className="bg-white p-5 rounded-xl border space-y-4">
          <h2 className="font-semibold">Booking Info</h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Guests" value={booking.guests} />
            <Field
              label="Total"
              value={`₹${booking.totalPrice?.toLocaleString()}`}
            />
            <Field label="Check-in" value={booking.checkIn} />
            <Field label="Check-out" value={booking.checkOut} />
          </div>
        </div>

        {/* USER */}
        <div className="bg-white p-5 rounded-xl border space-y-3">
          <h2 className="font-semibold">User</h2>

          <p className="font-medium">
            {user?.name || booking.userName || "Unknown"}
          </p>

          <p className="text-sm text-gray-500">{user?.email || "No email"}</p>

          <p className="text-xs text-gray-400">ID: {user?.id || "N/A"}</p>

          {user?.id && (
            <button
              onClick={() => navigate(`/admin/users/${user.id}`)}
              className="text-indigo-600 text-sm"
            >
              View Profile
            </button>
          )}
        </div>

        {/* PROPERTY */}
        <div className="bg-white p-5 rounded-xl border space-y-3 md:col-span-2">
          <h2 className="font-semibold">Property</h2>

          {property ? (
            <>
              <p className="font-medium">{property.title}</p>
              <p className="text-sm text-gray-500">{property.fullLocation}</p>

              <button
                onClick={() => navigate(`/admin/listings/${property._id}`)}
                className="text-indigo-600 text-sm"
              >
                View Property
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400">Property not available</p>
          )}
        </div>

        {/* STATUS UPDATE */}
        <div className="bg-white p-5 rounded-xl border md:col-span-2 space-y-4">
          <h2 className="font-semibold">Update</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              className="border p-2 rounded"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={form.paymentStatus}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  paymentStatus: e.target.value,
                }))
              }
              className="border p-2 rounded"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <button
            onClick={handleUpdate}
            disabled={updating}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
