import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

const MyBookings = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get(`/bookings?user=${user._id}`);

      // Sort bookings by Check-in date (upcoming first)
      const sortedBookings = (res.data.data || []).sort(
        (a, b) => new Date(a.checkIn) - new Date(b.checkIn),
      );
      setBookings(sortedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setMessage(err.response?.data?.message || "Failed to load your trips.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      )
    )
      return;

    try {
      setActionLoading(bookingId);
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? res.data.data : b)),
        );
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );

  if (!isAuthenticated)
    return (
      <div className="text-center mt-20 max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800">Please log in</h2>
        <p className="text-gray-500 mt-2">
          You need an account to view your bookings.
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
        <p className="text-gray-500 mt-1">
          Manage all your upcoming and past reservations.
        </p>
      </div>

      {message && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-36 bg-gray-100 animate-pulse rounded-2xl"
            ></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900">
            No trips booked... yet!
          </h3>
          <p className="text-gray-500 mt-2 mb-6">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            const isCancelled = booking.status === "cancelled";
            const isCancelling = actionLoading === booking._id;

            return (
              <div
                key={booking._id}
                className={`flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border ${isCancelled ? "border-red-100 opacity-75" : "border-gray-200 hover:shadow-md"} transition-all overflow-hidden`}
              >
                {/* Property Image Fallback */}
                <div className="w-full md:w-48 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                  {booking.property?.coverImage ? (
                    <img
                      src={booking.property.coverImage}
                      alt={booking.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-bold text-gray-900 truncate pr-4">
                        {booking.property?.title || "Unknown Property"}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border capitalize whitespace-nowrap ${isCancelled ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}
                      >
                        {booking.status.replace("-", " ")}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 flex items-center gap-1">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {booking.property?.location?.area},{" "}
                      {booking.property?.location?.city}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">
                        Dates
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {new Date(booking.checkIn).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}{" "}
                        -{" "}
                        {new Date(booking.checkOut).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">
                        Guests
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {booking.guests}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">
                        Total
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        ₹{booking.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 p-6 md:w-48 flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100">
                  <button
                    onClick={() =>
                      navigate(`/booking-detail/${booking._id}`, {
                        state: { booking },
                      })
                    }
                    className="flex-1 w-full bg-black text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
                  >
                    Manage Trip
                  </button>
                  {!isCancelled && booking.status !== "completed" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={isCancelling}
                      className="flex-1 w-full text-red-600 px-4 py-2.5 rounded-xl font-medium hover:bg-red-50 border border-transparent transition disabled:opacity-50"
                    >
                      {isCancelling ? "Processing..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
