import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

// ---------------- UTILITY FUNCTIONS ----------------

const formatDateFull = (date) =>
  new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatDateDay = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const calculateNights = (checkIn, checkOut) =>
  Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

const getStatusStyles = (status) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "checked-in": "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return styles[status] || styles.pending;
};

const getPaymentStatusStyles = (status) => {
  const styles = {
    paid: "bg-emerald-100 text-emerald-800",
    refunded: "bg-gray-200 text-gray-800",
    pending: "bg-orange-100 text-orange-800",
  };
  return styles[status] || styles.pending;
};

// ---------------- MAIN COMPONENT ----------------

const BookingDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(!state?.booking);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  // Fetch booking if not passed via state
  const fetchBooking = useCallback(async (bookingId) => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/bookings/${bookingId}`);
      setBooking(data.data);
    } catch (err) {
      setError("Failed to load booking details");
      console.error("Fetch booking error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!booking && state?.booking?._id) {
      fetchBooking(state.booking._id);
    }
  }, [booking, state?.booking?._id, fetchBooking]);

  const nights = calculateNights(booking?.checkIn, booking?.checkOut);
  const isCancelled = booking?.status === "cancelled";
  const canCancel = !isCancelled && booking?.status !== "completed";

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsCancelling(true);
      setError("");
      const { data } = await api.patch(`/bookings/${booking._id}/cancel`);

      if (data.success) {
        setBooking(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
      console.error("Cancel error:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  // No booking
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          No booking details found
        </h2>
        <p className="text-gray-500 max-w-sm">
          The booking you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
        >
          Go Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 gap-2 transition-colors group"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
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
        Back to My Trips
      </button>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3">
          <svg
            className="w-5 h-5 flex-shrink-0"
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
          {error}
        </div>
      )}

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-8 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold border capitalize ${getStatusStyles(booking.status)}`}
                >
                  {booking.status.replace("-", " ")}
                </span>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono truncate max-w-[200px]">
                  #{booking._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent leading-tight">
                {booking.property?.title || "Property"}
              </h1>
              <p className="mt-3 text-lg text-gray-600 flex items-start gap-2">
                <svg
                  className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {booking.property?.fullLocation ||
                  `${booking.property?.location?.area || ""}, ${booking.property?.location?.city || ""}`}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 lg:p-12 grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Trip Details */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">
              Trip Details
            </h2>

            <div className="bg-gradient-to-r from-blue-50/30 to-emerald-50/30 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Check-in
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDateDay(booking.checkIn)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.checkIn)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Check-out
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDateDay(booking.checkOut)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.checkOut)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-white/50">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Guests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.guests} Guest{booking.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Duration
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {nights} Night{nights > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Actions */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">
              Payment Summary
            </h2>

            <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-700">
                    ₹{booking.property?.price?.toLocaleString("en-IN")} ×{" "}
                    {nights} nights
                  </span>
                  <span className="font-semibold">
                    ₹
                    {(booking.property?.price * nights)?.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-baseline pb-6">
                  <span className="text-2xl font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                    ₹{booking.totalPrice?.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    Payment Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPaymentStatusStyles(booking.paymentStatus)}`}
                  >
                    {booking.paymentStatus?.replace("-", " ") || "Unknown"}
                  </span>
                </div>
              </div>

              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling
                    ? "Processing Cancellation..."
                    : "Cancel This Booking"}
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-8 border-t border-gray-200 text-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-2xl">
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">Booked on:</span>{" "}
                {formatDateFull(booking.createdAt)}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Last Updated:
                </span>{" "}
                {formatDateFull(booking.updatedAt)}
              </p>
            </div>

            {isCancelled && booking.cancelledAt && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 p-6 rounded-2xl">
                <p className="font-bold text-red-900 mb-2 flex items-center gap-2 text-sm">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Cancelled on {formatDateFull(booking.cancelledAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
