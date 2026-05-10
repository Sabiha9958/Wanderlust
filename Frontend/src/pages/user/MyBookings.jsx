import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value = 0) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 size={14} />,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  pending: {
    label: "Pending",
    icon: <Clock3 size={14} />,
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  cancelled: {
    label: "Cancelled",
    icon: <XCircle size={14} />,
    classes: "bg-red-50 text-red-700 border-red-200",
  },
};

/* -------------------------------------------------------------------------- */
/* BOOKING CARD                                                               */
/* -------------------------------------------------------------------------- */

const BookingCard = memo(
  ({ booking, onViewDetails, onCancel, actionLoading }) => {
    const status = statusConfig[booking?.status] || statusConfig.pending;

    const nights = useMemo(
      () => getNights(booking?.checkIn, booking?.checkOut),
      [booking],
    );

    const isCancelling = actionLoading === booking?._id;

    return (
      <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
        <div className="grid lg:grid-cols-[1fr_240px]">
          {/* LEFT */}

          <div className="p-7">
            {/* TOP */}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${status.classes}`}
                >
                  {status.icon}
                  {status.label}
                </div>

                <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                  {booking?.paymentStatus}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total
                </p>

                <h3 className="mt-1 text-2xl font-bold text-black">
                  {formatCurrency(booking?.totalPrice)}
                </h3>
              </div>
            </div>

            {/* TITLE */}

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {booking?.property?.title}
            </h2>

            {/* LOCATION */}

            <div className="mt-3 flex items-center gap-2 text-gray-500">
              <MapPin size={16} />

              <span>
                {booking?.property?.location?.area},{" "}
                {booking?.property?.location?.city}
              </span>
            </div>

            {/* TICKET STYLE INFO */}

            <div className="relative mt-8 overflow-hidden rounded-[30px] border border-dashed border-gray-300 bg-[#FAFAFA]">
              <div className="grid gap-5 p-6 md:grid-cols-4">
                <TicketItem
                  icon={<CalendarDays size={18} />}
                  label="Check In"
                  value={formatDate(booking?.checkIn)}
                />

                <TicketItem
                  icon={<CalendarDays size={18} />}
                  label="Check Out"
                  value={formatDate(booking?.checkOut)}
                />

                <TicketItem
                  icon={<Users size={18} />}
                  label="Guests"
                  value={`${booking?.guests} Guests`}
                />

                <TicketItem
                  icon={<Clock3 size={18} />}
                  label="Stay"
                  value={`${nights} Nights`}
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex flex-col justify-center border-t border-gray-100 bg-[#FCFCFC] p-6 lg:border-l lg:border-t-0">
            <button
              onClick={() => onViewDetails(booking?._id, booking)}
              className="flex items-center justify-center gap-2 rounded-[20px] bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              View Details
              <ArrowRight size={16} />
            </button>

            {booking?.status !== "cancelled" && (
              <button
                onClick={() => onCancel(booking?._id)}
                disabled={isCancelling}
                className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

BookingCard.displayName = "BookingCard";

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

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
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/bookings?user=${user?._id}`);

      setBookings(data?.data || []);
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchBookings();
    }
  }, [fetchBookings, isAuthenticated, user?._id]);

  const handleCancel = useCallback(async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(bookingId);

      const { data } = await api.patch(`/bookings/${bookingId}/cancel`);

      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? data?.data : item)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleViewDetails = useCallback(
    (bookingId, booking) => {
      navigate(`/booking/${bookingId}`, {
        state: { booking },
      });
    },
    [navigate],
  );

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-10">
      <div className="mx-auto max-w-7xl px-5">
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              ✈️ Premium Booking Center
            </div>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-gray-900">
              My Bookings
            </h1>

            <p className="mt-3 max-w-2xl text-lg text-gray-500">
              View all your upcoming stays, reservations, and booking activity.
            </p>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white px-8 py-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>

            <h2 className="mt-2 text-4xl font-bold text-black">
              {bookings.length}
            </h2>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading && bookings.length === 0 ? (
          <div className="rounded-[40px] border border-dashed border-gray-300 bg-white px-6 py-24 text-center">
            <div className="text-7xl">🧳</div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              No Bookings Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Explore premium stays and book your next experience.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-8 rounded-[20px] bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-900"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="space-y-7">
            {bookings.map((booking) => (
              <BookingCard
                key={booking?._id}
                booking={booking}
                onViewDetails={handleViewDetails}
                onCancel={handleCancel}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SMALL COMPONENTS                                                           */
/* -------------------------------------------------------------------------- */

function TicketItem({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-black">{icon}</div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <h4 className="mt-1 text-sm font-bold text-gray-900">{value}</h4>
    </div>
  );
}

export default MyBookings;
