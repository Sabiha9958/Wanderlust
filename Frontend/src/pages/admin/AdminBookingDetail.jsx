import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

/* ---------- HELPERS ---------- */

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
      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border ${style}`}
    >
      {value || "unknown"}
    </span>
  );
};

const Field = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-900 break-words">
      {value || (
        <span className="text-gray-400 font-normal italic">Not available</span>
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

      // Handle both singular object or array responses
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

  /* ---------- ACTIONS ---------- */
  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await api.put(`/bookings/${id}`, form);
      await fetchBooking();
      alert("Booking updated successfully!");
    } catch (err) {
      alert("Failed to update booking.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? This may process refunds automatically depending on your backend logic.",
      )
    )
      return;
    try {
      // Assuming a dedicated endpoint for cancellation, or just update via PUT
      await api.put(`/bookings/${id}`, { ...form, status: "cancelled" });
      fetchBooking();
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  /* ---------- RENDER STATES ---------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === "error" || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Booking Not Found
        </h2>
        <button
          onClick={() => navigate("/admin/bookings")}
          className="text-indigo-600 hover:underline font-medium"
        >
          Return to Bookings
        </button>
      </div>
    );
  }

  /* ---------- DERIVED ---------- */
  const property = booking.property;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to List
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              Reservation Details
              <span className="font-mono text-sm bg-gray-100 text-gray-500 px-2 py-1 rounded">
                #{booking._id}
              </span>
            </h1>
          </div>

          <div className="flex gap-3">
            {booking.status !== "cancelled" && (
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition shadow-sm"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COL (Property & Booking Info) */}
          <div className="lg:col-span-2 space-y-6">
            {/* ITINERARY */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-500"
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
                Itinerary & Charges
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Field
                  label="Check-in"
                  value={new Date(booking.checkIn).toLocaleDateString(
                    undefined,
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                />
                <Field
                  label="Check-out"
                  value={new Date(booking.checkOut).toLocaleDateString(
                    undefined,
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                />
                <Field label="Total Guests" value={booking.guests} />
                <Field
                  label="Total Price"
                  value={`₹${booking.totalPrice?.toLocaleString()}`}
                />
              </div>
            </div>

            {/* PROPERTY & GUEST DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PROPERTY */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Property
                </h2>

                {property ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {property.fullLocation}
                      </p>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        Base Price
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{property.price} / night
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/admin/listings/${property._id}`)
                      }
                      className="w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                    >
                      View Property Details
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-center">
                    <p className="text-sm font-medium text-rose-700">
                      Property data is unavailable or has been deleted.
                    </p>
                  </div>
                )}
              </div>

              {/* GUEST */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
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
                  Guest Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {booking.userName || "Unknown Guest"}
                    </p>
                    <p className="text-xs font-mono text-gray-500 mt-1 break-all">
                      ID: {booking.createdBy || booking.user || "N/A"}
                    </p>
                  </div>
                  {/* If you have user email/phone from population, display it here */}
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/users/${booking.createdBy || booking.user}`,
                      )
                    }
                    className="w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    View User Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL (Status & Meta) */}
          <div className="lg:col-span-1 space-y-6">
            {/* STATUS MANAGEMENT */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Manage Status
              </h3>

              <div className="space-y-5">
                {/* Current Badges */}
                <div className="flex gap-2 flex-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <Badge value={booking.status} />
                  <Badge value={booking.paymentStatus} type="payment" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Reservation Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked-in">Checked-in</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Payment Status
                    </label>
                    <select
                      value={form.paymentStatus}
                      onChange={(e) =>
                        setForm({ ...form, paymentStatus: e.target.value })
                      }
                      className="w-full border border-gray-300 p-2.5 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partially-paid">Partially Paid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <button
                    disabled={updating}
                    onClick={handleUpdate}
                    className="w-full bg-indigo-600 text-white font-medium px-4 py-3 rounded-lg shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {updating ? "Updating..." : "Update Booking"}
                  </button>
                </div>
              </div>
            </div>

            {/* TIMESTAMPS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3 text-sm">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                System Logs
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-900">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium text-gray-900">
                  {new Date(booking.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {booking.cancelledAt && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                  <span className="text-rose-500 font-medium">
                    Cancelled On
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.cancelledAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
