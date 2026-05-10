import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import api from "../../api/axiosInstance";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value = 0) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const bookingStatus = {
  confirmed: {
    label: "Confirmed",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 size={15} />,
  },

  pending: {
    label: "Pending",
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock3 size={15} />,
  },

  cancelled: {
    label: "Cancelled",
    classes: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle size={15} />,
  },
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                   */
/* -------------------------------------------------------------------------- */

const BookingDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(!state?.booking);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/bookings/${id}`);

      setBooking(data?.data || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!booking && id) {
      fetchBooking();
    }
  }, [booking, id, fetchBooking]);

  const nights = useMemo(
    () => calculateNights(booking?.checkIn, booking?.checkOut),
    [booking],
  );

  const status = bookingStatus[booking?.status] || bookingStatus.pending;

  const canCancel =
    booking?.status !== "cancelled" && booking?.status !== "completed";

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      setCancelLoading(true);

      const { data } = await api.patch(`/bookings/${booking?._id}/cancel`);

      setBooking(data?.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          <p className="text-gray-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7] p-6">
        <div className="max-w-md rounded-[32px] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900">
            Booking Not Found
          </h2>

          <p className="mt-3 text-gray-500">
            This booking does not exist or may have been removed.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-8 rounded-2xl bg-black px-6 py-3 font-semibold text-white"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-10">
      <div className="mx-auto max-w-7xl px-5">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={17} />
          Back to Bookings
        </button>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[36px] border border-gray-200 bg-white shadow-sm">
          {/* TOP */}

          <div className="border-b border-gray-100 bg-white px-8 py-8 lg:px-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${status.classes}`}
                >
                  {status.icon}
                  {status.label}
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
                  {booking?.property?.title}
                </h1>

                <div className="mt-4 flex items-start gap-3 text-gray-500">
                  <MapPin size={18} className="mt-1" />

                  <p>
                    {booking?.property?.location?.addressLine},{" "}
                    {booking?.property?.location?.area},{" "}
                    {booking?.property?.location?.city},{" "}
                    {booking?.property?.location?.state} -{" "}
                    {booking?.property?.location?.pincode}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-[#FAFAFA] px-8 py-6 text-center">
                <p className="text-sm font-medium text-gray-500">Booking ID</p>

                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  #{booking?._id?.slice(-8)?.toUpperCase()}
                </h3>
              </div>
            </div>
          </div>

          {/* BODY */}

          <div className="grid gap-8 p-6 lg:grid-cols-[1.6fr_420px] lg:p-10">
            {/* LEFT */}

            <div className="space-y-8">
              {/* TIMELINE */}

              <div className="rounded-[32px] border border-gray-200 bg-white p-7">
                <div className="mb-7 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Stay Timeline
                  </h2>

                  <div className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white">
                    {nights} Nights
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <TimelineCard
                    title="Check In"
                    date={formatDate(booking?.checkIn)}
                    time={formatTime(booking?.checkIn)}
                  />

                  <TimelineCard
                    title="Check Out"
                    date={formatDate(booking?.checkOut)}
                    time={formatTime(booking?.checkOut)}
                  />
                </div>
              </div>

              {/* BOOKING INFO */}

              <div className="rounded-[32px] border border-gray-200 bg-white p-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Information
                </h2>

                <div className="mt-7 grid gap-5 md:grid-cols-3">
                  <InfoCard
                    icon={<Users size={18} />}
                    label="Guests"
                    value={`${booking?.guests} Guests`}
                  />

                  <InfoCard
                    icon={<CalendarDays size={18} />}
                    label="Booked On"
                    value={formatDate(booking?.createdAt)}
                  />

                  <InfoCard
                    icon={<ShieldCheck size={18} />}
                    label="Payment"
                    value={booking?.paymentStatus}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="space-y-6">
              {/* PRICE CARD */}

              <div className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Price Summary
                  </h2>

                  <div className="rounded-2xl bg-gray-100 p-3">
                    <CreditCard size={20} className="text-gray-700" />
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  <PriceRow
                    label="Price Per Night"
                    value={formatCurrency(booking?.pricePerNight)}
                  />

                  <PriceRow
                    label={`Stay (${nights} Nights)`}
                    value={formatCurrency(booking?.pricePerNight * nights)}
                  />

                  <div className="border-t border-dashed border-gray-200 pt-5">
                    <PriceRow
                      label="Grand Total"
                      value={formatCurrency(booking?.totalPrice)}
                      highlight
                    />
                  </div>
                </div>
              </div>

              {/* GUEST CARD */}

              <div className="rounded-[32px] border border-gray-200 bg-white p-7 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-black text-2xl font-bold text-white">
                    {booking?.user?.name?.charAt(0)}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {booking?.user?.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {booking?.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="w-full rounded-[24px] bg-red-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelLoading ? "Cancelling Booking..." : "Cancel Booking"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SMALL COMPONENTS                                                           */
/* -------------------------------------------------------------------------- */

function TimelineCard({ title, date, time }) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-[#FAFAFA] p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <h3 className="mt-4 text-xl font-bold text-gray-900">{date}</h3>

      <p className="mt-2 text-sm text-gray-500">{time}</p>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-[#FAFAFA] p-5">
      <div className="flex items-center gap-2 text-black">{icon}</div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <h3 className="mt-2 text-lg font-bold text-gray-900">{value}</h3>
    </div>
  );
}

function PriceRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>

      <span
        className={`font-bold ${
          highlight ? "text-2xl text-black" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default BookingDetail;
