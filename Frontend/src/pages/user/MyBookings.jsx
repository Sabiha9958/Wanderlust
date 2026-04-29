import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

// ---------------- UTILITY FUNCTIONS ----------------

const formatDateRange = (checkIn, checkOut) => {
  const options = { month: "short", day: "numeric" };
  return `${new Date(checkIn).toLocaleDateString(undefined, options)} - ${new Date(checkOut).toLocaleDateString(undefined, options)}`;
};

const getStatusStyles = (status) => {
  const statusMap = {
    cancelled: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    confirmed: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    completed: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
  };
  return statusMap[status] || statusMap.pending;
};

// ---------------- BOOKING CARD COMPONENT ----------------

const BookingCard = memo(
  ({ booking, onCancel, actionLoading, onViewDetails }) => {
    const isCancelled = booking.status === "cancelled";
    const isCancelling = actionLoading === booking._id;
    const statusStyles = getStatusStyles(booking.status);

    return (
      <div
        className={`flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${
          isCancelled
            ? "border-red-100 opacity-75"
            : "border-gray-200 hover:shadow-md"
        }`}
      >
        {/* Property Image */}
        <div className="w-full md:w-48 h-48 md:h-auto bg-gray-200 flex-shrink-0 relative overflow-hidden">
          {booking.property?.coverImage ? (
            <img
              src={booking.property.coverImage}
              alt={booking.property.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
              <svg
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 truncate pr-4 max-w-[70%]">
                {booking.property?.title || "Unknown Property"}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border capitalize whitespace-nowrap shrink-0 ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}
              >
                {booking.status.replace("-", " ")}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
              <svg
                className="w-4 h-4 flex-shrink-0"
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
              {booking.property?.location?.area},{" "}
              {booking.property?.location?.city}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Dates
              </p>
              <p className="text-sm font-semibold mt-1">
                {formatDateRange(booking.checkIn, booking.checkOut)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Guests
              </p>
              <p className="text-sm font-semibold mt-1">{booking.guests}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Total
              </p>
              <p className="text-sm font-semibold mt-1">
                ₹{booking.totalPrice?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 md:border-t-0 md:border-l md:w-48 flex flex-col md:flex-col justify-center gap-3">
          <button
            onClick={() => onViewDetails(booking._id, booking)}
            className="w-full bg-gradient-to-r from-gray-900 to-black text-white px-4 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
          >
            Manage Trip
          </button>
          {!isCancelled && booking.status !== "completed" && (
            <button
              onClick={() => onCancel(booking._id)}
              disabled={isCancelling}
              className="w-full text-red-600 hover:bg-red-50 focus:bg-red-50 px-4 py-3 rounded-xl font-semibold border border-red-200 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Processing..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </div>
    );
  },
);

BookingCard.displayName = "BookingCard";

// ---------------- MAIN COMPONENT ----------------

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
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated || !user?._id) return;

    try {
      setLoading(true);
      setErrorMessage("");
      const { data } = await api.get(`/bookings?user=${user._id}`);

      const sortedBookings = (data.data || []).sort(
        (a, b) => new Date(a.checkIn) - new Date(b.checkIn),
      );
      setBookings(sortedBookings);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load your trips.";
      setErrorMessage(message);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = useCallback(async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(bookingId);
      const { data } = await api.patch(`/bookings/${bookingId}/cancel`);

      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? data.data : b)),
        );
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to cancel booking";
      alert(message);
      console.error("Cancel booking error:", err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleViewDetails = useCallback(
    (bookingId, booking) => {
      navigate(`/booking/${bookingId}`, { state: { booking } });
    },
    [navigate],
  );

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 max-w-md mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Please log in</h2>
        <p className="text-gray-500 mb-8">
          You need an account to view your bookings.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
          My Trips
        </h1>
        <p className="text-xl text-gray-600">
          Manage all your upcoming and past reservations
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-center font-medium">
          {errorMessage}
          <button
            onClick={fetchBookings}
            className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid md:grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-7xl mx-auto mb-6 w-24 h-24">✈️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No trips booked... yet!
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-black to-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              actionLoading={actionLoading}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
