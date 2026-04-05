import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

const BookingDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(state?.booking);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg text-gray-500 font-medium">
          No booking details found.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  // Helper Functions
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

  // Calculate Nights
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
  );

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    "checked-in": "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      )
    )
      return;
    try {
      setIsCancelling(true);
      const res = await api.patch(`/bookings/${booking._id}/cancel`);
      if (res.data.success) {
        setBooking(res.data.data); // Update local state to show cancelled status
        alert("Booking cancelled successfully.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Bookings
      </button>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="bg-gray-50 p-6 md:p-8 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusColors[booking.status] || "bg-gray-100 text-gray-800"}`}
              >
                {booking.status.replace("-", " ")}
              </span>
              <span className="text-gray-500 text-sm font-mono">
                ID: {booking._id}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {booking.property?.title}
            </h1>
            <p className="text-gray-600 mt-2 flex items-start gap-1.5">
              <svg
                className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {booking.property?.fullLocation ||
                `${booking.property?.location?.area}, ${booking.property?.location?.city}, ${booking.property?.location?.state}, ${booking.property?.location?.country}`}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Trip Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              Trip Details
            </h3>

            <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-200">
                <div className="flex-1 p-4 border-r border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Check-in
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDateDay(booking.checkIn)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.checkIn)}
                  </p>
                </div>
                <div className="flex-1 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Check-out
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDateDay(booking.checkOut)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(booking.checkOut)}
                  </p>
                </div>
              </div>
              <div className="p-4 flex justify-between bg-white">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Guests
                  </p>
                  <p className="font-semibold text-gray-900">
                    {booking.guests} Guest{booking.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="font-semibold text-gray-900">
                    {nights} Night{nights > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Payment */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              Payment Summary
            </h3>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <div className="flex justify-between text-gray-700">
                <span>
                  ₹{booking.property?.price?.toLocaleString()} x {nights} nights
                </span>
                <span>
                  ₹{(booking.property?.price * nights).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-lg">
                  Total Cost
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{booking.totalPrice?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600 font-medium">
                  Payment Status
                </span>
                <span
                  className={`text-sm font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    booking.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : booking.paymentStatus === "refunded"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {booking.paymentStatus.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Manage Action */}
            {booking.status !== "cancelled" &&
              booking.status !== "completed" && (
                <div className="pt-2">
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="w-full text-center py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {isCancelling
                      ? "Processing Cancellation..."
                      : "Cancel this Booking"}
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Footer Metadata & Cancellation Info */}
        <div className="bg-gray-50 p-6 md:px-8 border-t border-gray-200 text-sm text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p>
              <strong>Booked on:</strong> {formatDateFull(booking.createdAt)}
            </p>
            <p>
              <strong>Last Updated:</strong> {formatDateFull(booking.updatedAt)}
            </p>
          </div>

          {booking.status === "cancelled" && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 text-sm">
              <p className="font-bold mb-1 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Cancellation Details
              </p>
              <p>Cancelled on: {formatDateFull(booking.cancelledAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
